'use strict';

const { Transform } = require('stream');
const { EOL } = require('os');
const util = require('util');
const jsonStringify = require('../json-stringify');

const {
	LEVEL_STRINGS,
	LEVEL_NUMBERS,
} = require('../constants');

/* eslint-disable array-bracket-newline */
const levelStringLookup = new Map([
	[ LEVEL_NUMBERS.TRACE, LEVEL_STRINGS.TRACE ],
	[ LEVEL_NUMBERS.DEBUG, LEVEL_STRINGS.DEBUG ],
	[ LEVEL_NUMBERS.INFO, LEVEL_STRINGS.INFO ],
	[ LEVEL_NUMBERS.WARN, LEVEL_STRINGS.WARN ],
	[ LEVEL_NUMBERS.ERROR, LEVEL_STRINGS.ERROR ],
	[ LEVEL_NUMBERS.FATAL, LEVEL_STRINGS.FATAL ],
]);
/* eslint-enable array-bracket-newline */

/**
 * List of known log record property names which are pretty printed when the makePretty flag
 * is set to true on the JsonStdoutStream instance. The rest of the log record properties will
 * be printed using util.inspect().
 */
const PRETTY_PROPS = Object.freeze([
	'time',
	'level',
	'hostname',
	'name',
	'pid',
	'msg',
]);

class JsonStdoutStream extends Transform {

	/**
	 * @param {String} [options.makePretty=false] Print the log lines out in human readable form instead of JSON text.
	 */
	constructor(options) {
		super({ objectMode: true });

		Object.defineProperties(this, {
			makePretty: { value: Boolean(options.makePretty) },
			level: {
				enumerable: true,
				writable: true,
				value: null,
			},
			levelN: {
				enumerable: true,
				writable: true,
				value: null,
			},
		});
	}

	init() {
		this.pipe(process.stdout);
	}

	dispose() {
		this.unpipe();
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
		const time = rec.time.toISOString();

		if (this.makePretty) {
			const levelString = levelStringLookup.get(rec.level);
			const level = `${ levelString && levelString.toUpperCase() } (${ rec.level })`;
			const logString = `${ time } - ${ level } - ${ rec.name } - ${ rec.msg }`;

			// Include the rest of the props that don't require special formatting.
			const userProps = Object.keys(rec).reduce((obj, key) => {
				if (!PRETTY_PROPS.includes(key)) {
					obj[key] = rec[key];
				}
				return obj;
			}, Object.create(null));

			// If the user defined props are empty, don't print out the
			// empty object.
			if (Object.keys(userProps).length === 0) {
				return `${ logString }`;
			}

			return `${ logString } -${ EOL }${ util.inspect(userProps) }`;
		}

		// Convert the time Date Object to an ISO string.
		rec.time = time;

		return jsonStringify(rec);
	}

	static create(options = {}) {
		return new JsonStdoutStream(options || {});
	}
}

module.exports = JsonStdoutStream;
