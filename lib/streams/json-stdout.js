'use strict';

const { Transform } = require('stream');
const { EOL } = require('os');
const util = require('util');
const jsonStringify = require('../json-stringify');

class JsonStdoutStream extends Transform {
	// options.makePretty (default = false)
	constructor(options) {
		super({ objectMode: true });

		Object.defineProperties(this, {
			makePretty: {
				value: Boolean(options.makePretty)
			}
		});
	}

	init() {
		this.pipe(process.stdout);
	}

	_transform(rec, encoding, callback) {
		process.nextTick(() => {
			try {
				callback(null, this.recordToString(rec) + EOL);
			} catch (err) {
				callback(err);
			}
		});
	}

	recordToString(rec) {
		if (this.makePretty) {
			const logString = `${rec.time.toISOString()} ${rec.level} - ${rec.name} - ${rec.msg}`;

			const userProps = Object.keys(rec).reduce((obj, key) => {
				if (!JsonStdoutStream.PRETTY_PROPS.includes(key)) {
					obj[key] = rec[key];
				}
				return obj;
			}, Object.create(null));

			// If the user defined props are empty, don't print out the
			// empty object.
			if (Object.keys(userProps).length === 0) {
				return `${logString}`;
			}

			return `${logString} -${EOL}${util.inspect(userProps)}`;
		}

		return jsonStringify(rec);
	}

	static create(options = {}) {
		return new JsonStdoutStream(options || {});
	}
}

JsonStdoutStream.PRETTY_PROPS = [
	'time',
	'level',
	'hostname',
	'name',
	'pid',
	'msg'
];

module.exports = JsonStdoutStream;
