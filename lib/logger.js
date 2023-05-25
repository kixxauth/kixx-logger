'use strict';

const os = require('os');

const {
	LEVEL_STRINGS,
	LEVEL_NUMBERS,
} = require('./constants');

const ArgumentError = require('./errors/argument-error');
const JsonStdoutStream = require('./streams/json-stdout');

const {
	isFunction,
	isUndefined,
	isNonEmptyString,
	safelyAssignProps,
} = require('./utils');

/* eslint-disable array-bracket-newline */
const levelStringLookup = new Map([
	[ LEVEL_NUMBERS.TRACE, LEVEL_STRINGS.TRACE ],
	[ LEVEL_NUMBERS.DEBUG, LEVEL_STRINGS.DEBUG ],
	[ LEVEL_NUMBERS.INFO, LEVEL_STRINGS.INFO ],
	[ LEVEL_NUMBERS.WARN, LEVEL_STRINGS.WARN ],
	[ LEVEL_NUMBERS.ERROR, LEVEL_STRINGS.ERROR ],
	[ LEVEL_NUMBERS.FATAL, LEVEL_STRINGS.FATAL ],
]);

const levelIntegerLookup = new Map([
	[ LEVEL_STRINGS.TRACE, LEVEL_NUMBERS.TRACE ],
	[ LEVEL_STRINGS.DEBUG, LEVEL_NUMBERS.DEBUG ],
	[ LEVEL_STRINGS.INFO, LEVEL_NUMBERS.INFO ],
	[ LEVEL_STRINGS.WARN, LEVEL_NUMBERS.WARN ],
	[ LEVEL_STRINGS.ERROR, LEVEL_NUMBERS.ERROR ],
	[ LEVEL_STRINGS.FATAL, LEVEL_NUMBERS.FATAL ],
]);
/* eslint-enable array-bracket-newline */

// Keepig a list of streams which have been initialized globally will avoid
// re-initializing stream instances which have already been initialized.
const initializedStreams = new Set();

class Logger {

	constructor(spec) {
		const { name } = spec;

		const defaultFields = {
			name,
			hostname: os.hostname(),
			pid: process.pid,
		};

		Object.assign(defaultFields, spec.defaultFields || {});
		Object.freeze(defaultFields);

		/* eslint-disable object-curly-newline */
		Object.defineProperties(this, {
			/**
			 * The given name of the logger.
			 * @type {String}
			 */
			name: {
				enumerable: true,
				value: name,
			},

			/**
			 * The current level string of the logger.
			 * @type {String}
			 */
			level: {
				enumerable: true,
				writable: true,
				value: spec.level,
			},

			/**
			 * The current level number of the logger.
			 * @type {Number}
			 */
			levelN: {
				writable: true,
				value: levelIntegerLookup.get(spec.level),
			},

			/**
			 * The default fields value mapping.
			 * @type {Object}
			 */
			defaultFields: {
				value: defaultFields,
			},

			/**
			 * A list of registered output streams.
			 * @type {Array}
			 */
			streams: {
				value: new Set(),
			},

			/**
			 * Serializers function mapping.
			 * @type {Object}
			 */
			serializers: {
				value: Object.freeze(spec.serializers),
			},

			/**
			 * A set of child logger instances.
			 * @type {Set}
			 */
			children: {
				value: new Set(),
			},
		});
		/* eslint-enable object-curly-newline */

		if (spec.stream) {
			this.addStream(spec.stream);
		}
	}

	/**
	 * Create a child logger inheriting all the attributes of this logger.
	 * @param {String} spec.name The name of your logger. Will throw if not provided.
	 * @param {String|Number} [spec.level="debug"] The level can be set using a string or integer.
	 * @param {Object} [spec.defaultFields={}] Values to include in every log message.
	 * @param {Object} [spec.serializers={}] Initialize the logger with a mapping of object serializers.
	 * @return {Logger}
	 */
	createChild(spec) {
		spec = spec || {};

		if (!isNonEmptyString(spec.name)) {
			throw new ArgumentError('A child logger name is required', this.createChild);
		}

		// Create a composed, ":" delineated parent:child logger name.
		const name = `${ this.name }:${ spec.name }`;

		let level = spec.level || this.level;

		if (typeof level !== 'string' && !Number.isInteger(level)) {
			throw new ArgumentError(
				`Invalid level argument: ${ level }. Must be an integer or string`,
				this.createChild
			);
		}

		if (Number.isInteger(level)) {
			level = levelStringLookup.get(level);

			if (!isNonEmptyString(level)) {
				throw new ArgumentError(`Invalid level number: ${ level }`, this.createChild);
			}
		} else if (isUndefined(levelIntegerLookup.get(level))) {
			throw new ArgumentError(`Invalid level string: "${ level }"`, this.createChild);
		}

		// Make a copy of this logger's fields to avoid mutating them, merge in default fields for
		// this child logger if specified, and overwrite the name for the child logger.
		const defaultFields = Object.assign(
			{},
			this.defaultFields,
			spec.defaultFields || {},
			{ name }
		);

		// Add any new serializers specified for this child logger without mutating the serializers
		// object assigned to the parent logger.
		const serializers = Object.assign({}, this.serializers, spec.serializers || {});

		const newLogger = new Logger({
			name,
			level,
			defaultFields,
			serializers,
		});

		// Add the streams from the parent logger to the child logger.
		this.streams.forEach((stream) => {
			newLogger.addStream(stream);
		});

		this.children.add(newLogger);

		return newLogger;
	}

	/**
	 * Reset the level of this logger instance and all its children.
	 * @param {Number|String} newLevel
	 * @return {Logger} This instance
	 */
	setLevel(newLevel) {
		let levelInteger;
		let levelString;

		if (Number.isInteger(newLevel)) {
			levelInteger = newLevel;
			levelString = levelStringLookup.get(levelInteger);

			if (!isNonEmptyString(levelString)) {
				throw new ArgumentError(`Invalid level number: ${ newLevel }`, this.setLevel);
			}
		} else if (isNonEmptyString(newLevel)) {
			levelString = newLevel;
			levelInteger = levelIntegerLookup.get(levelString);

			if (isUndefined(levelInteger)) {
				throw new ArgumentError(`Invalid level string: "${ newLevel }"`, this.setLevel);
			}
		} else if (typeof newLevel === 'string') {
			throw new ArgumentError('Invalid level argument: empty string', this.setLevel);
		} else {
			throw new ArgumentError(
				`Invalid level argument: ${ newLevel }. Must be an integer or string`,
				this.setLevel
			);
		}

		this.level = levelString;
		this.levelN = levelInteger;

		this.children.forEach((logger) => {
			logger.setLevel(levelInteger);
		});

		return this;
	}

	/**
	 * Add a new stream to this logger and all its children. A level may be specified for the
	 * stream, below which it will not receive output. If the stream has an init() method it will be
	 * called if it has not been called previously.
	 * @param {Stream} stream
	 * @param {String|Number} [level="trace"] The level can be set using a string or integer.
	 */
	addStream(stream, level) {
		if (!stream || !isFunction(stream.write)) {
			throw new ArgumentError(
				`A stream must be a Stream instance or provide a Stream API. (Given type "${ typeof stream }")`,
				this.addStream
			);
		}

		// Setup the stream level if it has not been set yet. Default to TRACE.
		if (isUndefined(stream.levelN)) {
			let levelInteger;
			let levelString;

			if (typeof level === 'number') {
				levelInteger = level;
				levelString = levelStringLookup.get(levelInteger);

				if (!isNonEmptyString(levelString)) {
					throw new ArgumentError(`Invalid level number: ${ level }`, this.addStream);
				}
			} else if (isNonEmptyString(level)) {
				levelString = level;
				levelInteger = levelIntegerLookup.get(levelString);

				if (isUndefined(levelInteger)) {
					throw new ArgumentError(`Invalid level string: "${ level }"`, this.addStream);
				}
			} else if (typeof level === 'string') {
				throw new ArgumentError('Invalid level argument: empty string', this.addStream);
			} else {
				levelString = LEVEL_STRINGS.TRACE;
				levelInteger = LEVEL_NUMBERS.TRACE;
			}

			// Set the level and levelN properties on the stream so that they are not mutable.
			Object.defineProperties(stream, {
				level: {
					enumerable: true,
					writable: false,
					value: levelString,
				},
				levelN: {
					writable: false,
					value: levelInteger,
				},
			});
		}

		// Initialize the stream if it has an init() method and has not been initialized yet.
		if (isFunction(stream.init) && !initializedStreams.has(stream)) {
			initializedStreams.add(stream);
			stream.init();
		}

		// Add the stream to this logger if it has not been added yet.
		if (!this.streams.has(stream)) {
			this.streams.add(stream);
		}

		// Add the stream to all the child loggers.
		this.children.forEach((logger) => {
			logger.addStream(stream);
		});


		return this;
	}

	/**
	 * Clean up any hanging references, streams, and event emitters.
	 */
	dispose() {
		this.children.forEach(function disposeLogger(logger) {
			logger.dispose();
		});

		this.children.clear();

		this.streams.forEach(function disposeStream(stream) {
			if (isFunction(stream.dispose)) {
				stream.dispose();
			}
		});

		this.streams.clear();
	}

	/**
	 * Emit a trace message.
	 * @param {String} message
	 * @param {Object} [obj]
	 */
	trace(message, obj) {
		if (this.levelN <= LEVEL_NUMBERS.TRACE) {
			this.emit(LEVEL_NUMBERS.TRACE, message, obj);
		}
	}

	/**
	 * Emit a trace message.
	 * @param {String} message
	 * @param {Object} [obj]
	 */
	debug(message, obj) {
		if (this.levelN <= LEVEL_NUMBERS.DEBUG) {
			this.emit(LEVEL_NUMBERS.DEBUG, message, obj);
		}
	}

	/**
	 * Emit an info message.
	 * @param {String} message
	 * @param {Object} [obj]
	 */
	info(message, obj) {
		if (this.levelN <= LEVEL_NUMBERS.INFO) {
			this.emit(LEVEL_NUMBERS.INFO, message, obj);
		}
	}

	/**
	 * Emit an info message.
	 * @param {String} message
	 * @param {Object} [obj]
	 */
	log(message, obj) {
		if (this.levelN <= LEVEL_NUMBERS.INFO) {
			this.emit(LEVEL_NUMBERS.INFO, message, obj);
		}
	}

	/**
	 * Emit a warn message.
	 * @param {String} message
	 * @param {Object} [obj]
	 */
	warn(message, obj) {
		if (this.levelN <= LEVEL_NUMBERS.WARN) {
			this.emit(LEVEL_NUMBERS.WARN, message, obj);
		}
	}

	/**
	 * Emit an error message.
	 * @param {String} message
	 * @param {Object} [obj]
	 */
	error(message, obj) {
		if (this.levelN <= LEVEL_NUMBERS.ERROR) {
			this.emit(LEVEL_NUMBERS.ERROR, message, obj);
		}
	}

	/**
	 * Emit a fatal message.
	 * @param {String} message
	 * @param {Object} [obj]
	 */
	fatal(message, obj) {
		if (this.levelN <= LEVEL_NUMBERS.FATAL) {
			this.emit(LEVEL_NUMBERS.FATAL, message, obj);
		}
	}

	/**
	 * @private
	 */
	emit(level, msg, obj) {
		const now = new Date();

		const rec = this.createRecord({
			level,
			time: now.toISOString(),
			msg,
			obj,
		});

		this.streams.forEach(function emitOnStream(stream) {
			if (stream.levelN <= level) {
				stream.write(rec);
			}
		});
	}

	/**
	 * @private
	 */
	createRecord(args) {
		const {
			level,
			time,
			msg,
			obj,
		} = args;

		const { defaultFields, serializers } = this;
		const staticFields = Object.assign({}, defaultFields, { time, level, msg });
		// Do Not trust the getters in the in the user passed obj parameter. Use
		// safelyAssignProps() to avoid errors dereferencing these properties.
		const dynamicFields = safelyAssignProps({}, obj);

		const staticKeys = Object.keys(staticFields);

		Object.keys(dynamicFields).forEach((key) => {
			if (staticKeys.includes(key)) {
				// Move conflicting property names to use the "$" prefix.
				staticFields[`$${ key }`] = dynamicFields[key];
			} else {
				staticFields[key] = dynamicFields[key];
			}
		});

		// Static fields become all fields after merging above.
		const allFields = staticFields;

		// Serialize any fields which have corresponding serializers. Look up the serializer
		// by the property name from Object.keys() and invoke it if the property also
		// exists on the fields for this log record. Replace the field with the result from the
		// serializer. If an error occurs then catch it and assign a useful error string instead.
		return Object.keys(serializers).reduce(function walkSerializers(serializedFields, key) {
			if (Object.prototype.hasOwnProperty.call(allFields, key)) {
				const serialize = serializers[key];

				try {
					serializedFields[key] = serialize(allFields[key]);
				} catch (err) {
					serializedFields[key] = `Error in serializer for "${ key }": ${ err.name }: ${ err.message }`;
				}
			}

			return serializedFields;
		}, allFields);
	}

	/**
	 * @param {String} spec.name The name of your logger. Will throw if not provided.
	 * @param {String|Number} [spec.level="debug"] The level can be set using a string or integer.
	 * @param {Stream} [spec.stream=JsonStdoutStream] Initialize the logger with a specific output stream.
	 * @param {Object} [spec.defaultFields={}] Values to include in every log message.
	 * @param {Object} [spec.serializers={}] Initialize the logger with a mapping of object serializers.
	 * @return {Logger}
	 */
	static create(spec) {
		spec = spec || {};
		if (!isNonEmptyString(spec.name)) {
			throw new ArgumentError('A logger name is required', Logger.create);
		}

		let level;

		if (isUndefined(spec.level)) {
			level = LEVEL_STRINGS.DEBUG;
		} else if (Number.isInteger(spec.level)) {
			level = levelStringLookup.get(spec.level);

			if (!isNonEmptyString(level)) {
				throw new ArgumentError(`Invalid level number: ${ spec.level }`, Logger.create);
			}
		} else if (isNonEmptyString(spec.level)) {
			level = spec.level;

			if (isUndefined(levelIntegerLookup.get(level))) {
				throw new ArgumentError(`Invalid level string: "${ spec.level }"`, Logger.create);
			}
		} else if (typeof spec.level === 'string') {
			throw new ArgumentError('Invalid level argument: empty string', Logger.create);
		} else {
			throw new ArgumentError(
				`Invalid level argument: ${ spec.level }. Must be an integer or string`,
				Logger.create
			);
		}

		let stream;

		if (spec.stream) {
			stream = spec.stream;

			if (!isFunction(stream.write)) {
				throw new ArgumentError(
					`A stream must be a Stream instance or provide a Stream API. (Given type "${ typeof stream }")`,
					Logger.create
				);
			}
		} else {
			stream = JsonStdoutStream.create();
		}

		return new Logger({
			name: spec.name,
			level,
			stream,
			defaultFields: spec.defaultFields || {},
			serializers: spec.serializers || {},
		});
	}
}

Object.defineProperties(Logger, {
	Levels: {
		enumerable: true,
		value: Object.freeze({
			TRACE: LEVEL_STRINGS.TRACE,
			DEBUG: LEVEL_STRINGS.DEBUG,
			INFO: LEVEL_STRINGS.INFO,
			WARN: LEVEL_STRINGS.WARN,
			ERROR: LEVEL_STRINGS.ERROR,
			FATAL: LEVEL_STRINGS.FATAL,
		}),
	},
	Errors: {
		enumerable: true,
		value: Object.freeze({ ArgumentError }),
	},
});

module.exports = Logger;
