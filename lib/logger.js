'use strict';

class Logger {
	create(name) {
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

	emit(level, time, message, obj) {
		const rec = this.createRecord({
			level,
			time,
			message,
			obj
		});

		this.streams.forEach((stream) => stream.write(rec));
	}

	createRecord(args) {
		const {
			level,
			time,
			message,
			obj
		} = args;

		const { defaultFields, serializers } = this;

		const fields = Object.assign(
			{},
			defaultFields,
			{ level, time, message },
			obj
		);

		const serializedFields = serializers.reduce((serializedFields, serializer) => {
			const { key, serialize } = serializer;
			const val = fields[key];

			if (val !== undefined) {
				serializedFields[key] = serialize(val);
			}

			return serializedFields;
		}, {});
	}

	static create() {
		return new Logger();
	}
}

module.exports = Logger;
