'use strict';

const { Writable } = require('stream');
const { EOL } = require('os');
const jsonStringify = require('../json-stringify');

class JsonStdoutStream extends Writable {
	constructor(options) {
		super({ objectMode: true });

		Object.defineProperties(this, {
			outputStream: {
				value: options.outputStream || process.stdout
			},
			makePretty: {
				value: Boolean(options.makePretty)
			}
		});
	}

	init() {
		this.pipe(this.outputStream);
	}

	_write(rec, encoding, callback) {
		process.nextTick(() => {
			try {
				callback(null, this.recordToString(rec));
			} catch (err) {
				callback(err);
			}
		});
	}

	recordToString(rec) {
		if (this.makePretty) {
			const userProps = Object.keys(rec).reduce((obj, key) => {
				if (!JsonStdoutStream.PRETTY_PROPS.includes(key)) {
					obj[key] = rec.key;
				}
				return obj;
			}, Object.create(null));

			const json = jsonStringify(userProps, 2);

			const logString = JsonStdoutStream.PRETTY_PROPS.map((key) => {
				return `${key}: ${rec[key]}`;
			}).join(' - ');

			return `${logString}${EOL}${json}`;
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
