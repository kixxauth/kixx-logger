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
				value: null,
			},

			/**
			 * The current level number of the logger.
			 * @type {Number}
			 */
			levelN: {
				writable: true,
				value: null,
			},

			/**
			 * The default fields value mapping.
			 * @type {Object}
			 */
			defaultFields: {
				value: {
					name,
					hostname: os.hostname(),
					pid: process.pid,
				},
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
				value: Object.freeze(spec.serializers || {}),
			},

			/**
			 * A list of child logger instances.
			 * @type {Array}
			 */
			children: {
				value: new Set(),
			},
		});
		/* eslint-enable object-curly-newline */

		// The level can be set using a string or integer.
		const level = Number.isInteger(spec.level)
			? spec.level
			: (spec.level || LEVEL_STRINGS.DEBUG);

		this.setLevel(level);

		if (spec.defaultFields) {
			Object.assign(this.defaultFields, spec.defaultFields);
		}
		Object.freeze(this.defaultFields);

		if (spec.stream) {
			this.addStream(spec.stream);
		} else {
			this.addStream(JsonStdoutStream.create());
		}
	}

	/**
	 * Create a child logger inheriting all the attributes of this logger.
	 * @param {String} name
	 * @return {Logger}
	 */
	create(name) {
		if (!isNonEmptyString(name)) {
			throw new Error('A child logger must be given a name String');
		}

		const {
			level,
			streams,
			serializers,
		} = this;

		// Make a copy of this logger's fields to avoid mutating them and overwrite the name.
		const defaultFields = Object.assign({}, this.defaultFields, { name });

		const newLogger = new Logger({
			level,
			defaultFields,
			serializers,
		});

		// Add the streams from this logger to the child.
		streams.forEach((stream) => {
			newLogger.addStream(stream);
		});

		this.children.push(newLogger);

		return newLogger;
	}

	/**
	 * Reset the level of this logger instance.
	 * @param {Number|String} newLevel
	 * @return {Logger} This instance
	 */
	setLevel(newLevel) {
		let levelInteger;
		let levelString;

		if (Number.isInteger(newLevel)) {
			levelInteger = newLevel;
			levelString = levelStringLookup.get(levelInteger);

			if (!levelString) {
				throw new Error(
					`Logger#setLevel(newLevel) no level found for integer ${ newLevel }`
				);
			}
		} else if (isNonEmptyString(newLevel)) {
			levelString = newLevel;
			levelInteger = levelIntegerLookup.get(levelString);

			if (isUndefined(levelInteger)) {
				throw new Error(
					`Logger#setLevel(newLevel) invalid newLevel String "${ newLevel }"`
				);
			}
		} else {
			throw new Error(
				'Logger#setLevel(newLevel) newLevel must be a String or Integer'
			);
		}

		this.level = levelString;
		this.levelN = levelInteger;

		if (Array.isArray(this.children)) {
			this.children.forEach((logger) => {
				logger.setLevel(levelInteger);
			});
		}

		return this;
	}

	addStream(stream) {
		if (!this.streams.has(stream)) {
			// Re-use the setLevel() implementation from this Logger class to set the .level
			// property on the stream instance.
			this.setLevel.call(stream, stream.level || LEVEL_STRINGS.TRACE);
			this.streams.add(stream);
		}

		// Add the stream to all the child loggers.
		this.children.forEach((logger) => {
			logger.addStream(stream);
		});

		// If a stream has an init method and has not been called yet, then call it now.
		if (isFunction(stream.init) && !initializedStreams.has(stream)) {
			initializedStreams.add(stream);
			stream.init();
		}

		return this;
	}

	/**
	 * Emit a trace message.
	 * @param {String} message
	 * @param {Object} [obj]
	 */
	trace(message, obj) {
		if (this.levelN <= LEVEL_NUMBERS.TRACE) {
			this.emit(LEVEL_NUMBERS.TRACE, new Date(), message, obj);
		}
	}

	/**
	 * Emit a trace message.
	 * @param {String} message
	 * @param {Object} [obj]
	 */
	debug(message, obj) {
		if (this.levelN <= LEVEL_NUMBERS.DEBUG) {
			this.emit(LEVEL_NUMBERS.DEBUG, new Date(), message, obj);
		}
	}

	/**
	 * Emit an info message.
	 * @param {String} message
	 * @param {Object} [obj]
	 */
	info(message, obj) {
		if (this.levelN <= LEVEL_NUMBERS.INFO) {
			this.emit(LEVEL_NUMBERS.INFO, new Date(), message, obj);
		}
	}

	/**
	 * Emit a warn message.
	 * @param {String} message
	 * @param {Object} [obj]
	 */
	warn(message, obj) {
		if (this.levelN <= LEVEL_NUMBERS.WARN) {
			this.emit(LEVEL_NUMBERS.WARN, new Date(), message, obj);
		}
	}

	/**
	 * Emit an error message.
	 * @param {String} message
	 * @param {Object} [obj]
	 */
	error(message, obj) {
		if (this.levelN <= LEVEL_NUMBERS.ERROR) {
			this.emit(LEVEL_NUMBERS.ERROR, new Date(), message, obj);
		}
	}

	/**
	 * Emit a fatal message.
	 * @param {String} message
	 * @param {Object} [obj]
	 */
	fatal(message, obj) {
		if (this.levelN <= LEVEL_NUMBERS.FATAL) {
			this.emit(LEVEL_NUMBERS.FATAL, new Date(), message, obj);
		}
	}

	/**
	 * @private
	 */
	emit(level, time, msg, obj) {
		const rec = this.createRecord({
			level,
			time,
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

		// Combine all fields which should be included as object properties in the log record.
		const allFields = Object.assign(
			{},
			defaultFields,
			// Do Not trust the getters in the in the user passed obj parameter. Use
			// safelyAssignProps() to avoid errors dereferencing these properties.
			safelyAssignProps({ time, level, msg }, obj)
		);

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
	 * @param {Stream} [spec.stream] Initialize the logger with a specific output stream.
	 * @param {Object} [spec.defaultFields={}] Values to include in every log message.
	 * @param {Object} [spec.serializers={}] Initialize the logger with a mapping of object serializers.
	 */
	static create(spec) {
		spec = spec || {};
		if (!isNonEmptyString(spec.name)) {
			throw new ArgumentError('A logger name is required', Logger.create);
		}
		return new Logger(spec || {});
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
