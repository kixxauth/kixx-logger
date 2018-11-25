'use strict';

const os = require('os');
const { isFunction, isUndefined, isNonEmptyString } = require('./utils');

const TRACE = 'trace';
const TRACE_LEVEL = 10;

const DEBUG = 'debug';
const DEBUG_LEVEL = 20;

const INFO = 'info';
const INFO_LEVEL = 30;

const WARN = 'warn';
const WARN_LEVEL = 40;

const ERROR = 'error';
const ERROR_LEVEL = 50;

const FATAL = 'fatal';
const FATAL_LEVEL = 60;

const levelStringLookup = new Map([
	[ TRACE_LEVEL, TRACE ],
	[ DEBUG_LEVEL, DEBUG ],
	[ INFO_LEVEL, INFO ],
	[ WARN_LEVEL, WARN ],
	[ ERROR_LEVEL, ERROR ],
	[ FATAL_LEVEL, FATAL ]
]);

const levelIntegerLookup = new Map([
	[ TRACE, TRACE_LEVEL ],
	[ DEBUG, DEBUG_LEVEL ],
	[ INFO, INFO_LEVEL ],
	[ WARN, WARN_LEVEL ],
	[ ERROR, ERROR_LEVEL ],
	[ FATAL, FATAL_LEVEL ],
]);

const initializedStreams = [];

class Logger {
	// spec.name *optional*
	// spec.level *optional*
	// spec.defaultFields *optional*
	// spec.stream *optional*
	// spec.serializers *optional*
	constructor(spec) {
		Object.defineProperties(this, {
			level: {
				enumerable: true,
				writable: true,
				value: null
			},
			levelN: {
				writable: true,
				value: null
			},
			fields: {
				enumerable: true,
				value: Object.create(null)
			},
			streams: {
				enumerable: true,
				value: []
			},
			serializers: {
				enumerable: true,
				value: Object.create(null)
			},
			children: {
				value: []
			}
		});

		const level = Number.isInteger(spec.level)
			? spec.level
			: (spec.level || DEBUG);

		this.setLevel(level);

		this.assignDefaultFields({
			name: isNonEmptyString(spec.name) || 'root',
			hostname: os.hostname(),
			pid: process.pid
		});

		if (spec.defaultFields) {
			this.assignDefaultFields(spec.defaultFields);
		}

		if (spec.stream) {
			this.addStream(spec.stream);
		}

		if (spec.serializers) {
			this.assignSerializers(spec.serializers);
		}
	}

	create(name) {
		const {
			level,
			fields,
			streams,
			serializers
		} = this;

		const defaultFields = Object.assign({}, fields, { name });

		const newLogger = new Logger({
			level,
			defaultFields,
			serializers
		});

		streams.forEach((stream) => {
			newLogger.addStream(stream);
		});

		this.children.push(newLogger);

		return newLogger;
	}

	setLevel(newLevel) {
		let levelInteger;
		let levelString;

		if (Number.isInteger(newLevel)) {
			levelInteger = newLevel;
			levelString = levelStringLookup.get(levelInteger);

			if (!levelString) {
				throw new Error(
					`Logger#setLevel(newLevel) no level found for integer ${newLevel}`
				);
			}
		} else if (isNonEmptyString(newLevel)) {
			levelString = newLevel;
			levelInteger = levelIntegerLookup.get(levelString);

			if (isUndefined(levelInteger)) {
				throw new Error(
					`Logger#setLevel(newLevel) invalid newLevel String "${newLevel}"`
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

	assignDefaultFields(newFields) {
		Object.assign(this.fields, newFields);

		this.children.forEach((logger) => {
			logger.assignDefaultFields(newFields);
		});

		return this;
	}

	addStream(stream) {
		const hasStream = this.streams.includes(stream);

		if (!hasStream) {
			this.setLevel.call(stream, stream.level || TRACE);
			this.streams.push(stream);
		}

		this.children.forEach((logger) => {
			logger.addStream(stream);
		});

		if (isFunction(stream.init) && !initializedStreams.includes(stream)) {
			initializedStreams.push(stream);
			stream.init();
		}

		return this;
	}

	assignSerializers(newSerializers) {
		Object.assign(this.serializers, newSerializers);

		this.children.forEach((logger) => {
			logger.assignSerializers(newSerializers);
		});

		return this;
	}

	trace(message, obj) {
		if (this.levelN <= TRACE_LEVEL) {
			this.emit(TRACE, new Date(), message, obj);
		}
	}

	debug(message, obj) {
		if (this.levelN <= DEBUG_LEVEL) {
			this.emit(DEBUG, new Date(), message, obj);
		}
	}

	info(message, obj) {
		if (this.levelN <= INFO_LEVEL) {
			this.emit(INFO, new Date(), message, obj);
		}
	}

	warn(message, obj) {
		if (this.levelN <= WARN_LEVEL) {
			this.emit(WARN, new Date(), message, obj);
		}
	}

	error(message, obj) {
		if (this.levelN <= ERROR_LEVEL) {
			this.emit(ERROR, new Date(), message, obj);
		}
	}

	fatal(message, obj) {
		if (this.levelN <= FATAL_LEVEL) {
			this.emit(FATAL, new Date(), message, obj);
		}
	}

	emit(level, time, msg, obj) {
		const minLevel = levelIntegerLookup.get(level);

		const rec = this.createRecord({
			level,
			time,
			msg,
			obj
		});

		this.streams.forEach((stream) => {
			if (stream.levelN <= minLevel) {
				stream.write(rec);
			}
		});
	}

	createRecord(args) {
		const {
			level,
			time,
			msg,
			obj
		} = args;

		const { fields, serializers } = this;

		const allFields = Object.assign(
			{},
			fields,
			{ time, level, msg },
			obj
		);

		return Object.keys(serializers).reduce((serializedFields, key) => {
			const val = allFields[key];

			if (val !== undefined) {
				const serialize = serializers[key];
				serializedFields[key] = serialize(val);
			}

			return serializedFields;
		}, allFields);
	}

	static isValidLevelString(level) {
		return levelIntegerLookup.has(level);
	}

	static goLevel(check, level) {
		const n = levelIntegerLookup.get(level);
		return n <= levelIntegerLookup.get(check);
	}

	// spec.level *optional*
	// spec.defaultFields *optional*
	// spec.stream *optional*
	// spec.serializers *optional*
	static create(spec = {}) {
		return new Logger(spec || {});
	}
}

Object.defineProperties(Logger, {
	TRACE: {
		enumerable: true,
		value: TRACE
	},
	DEBUG: {
		enumerable: true,
		value: DEBUG
	},
	INFO: {
		enumerable: true,
		value: INFO
	},
	WARN: {
		enumerable: true,
		value: WARN
	},
	ERROR: {
		enumerable: true,
		value: ERROR
	},
	FATAL: {
		enumerable: true,
		value: FATAL
	},
});

module.exports = Logger;
