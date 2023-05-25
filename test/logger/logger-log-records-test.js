'use strict';

const os = require('os');
const sinon = require('sinon');
const { assert } = require('kixx-assert');
const { MockStream } = require('../test-utils');
const { Logger } = require('../../');

const LEVEL_STRINGS = Object.freeze({
	TRACE: 'trace',
	DEBUG: 'debug',
	INFO: 'info',
	WARN: 'warn',
	ERROR: 'error',
	FATAL: 'fatal',
});

const LEVEL_NUMBERS = Object.freeze({
	TRACE: 10,
	DEBUG: 20,
	INFO: 30,
	WARN: 40,
	ERROR: 50,
	FATAL: 60,
});

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

module.exports = function runTests(test) {

	test.describe('with default fields ONLY', (t) => {
		const sandbox = sinon.createSandbox();

		const expectedLevels = Object.keys(LEVEL_NUMBERS).map((key) => {
			return LEVEL_NUMBERS[key];
		});

		expectedLevels.splice(3, 0, LEVEL_NUMBERS.INFO);

		let logger;
		let records;

		t.before((done) => {
			const stream = MockStream.create();

			sandbox.spy(stream, 'write');

			logger = Logger.create({
				name: 'MyLogger',
				level: Logger.Levels.TRACE,
				stream,
			});

			logger.trace('trace record');
			logger.debug('debug record');
			logger.info('info record');
			logger.log('info record');
			logger.warn('warn record');
			logger.error('error record');
			logger.fatal('fatal record');

			records = stream.write.getCalls().map(({ args }) => {
				return args[0];
			});

			done();
		});

		t.after((done) => {
			logger.dispose();
			sandbox.restore();
			done();
		});

		t.it('emits expected records', () => {
			assert.isEqual(7, records.length);

			records.forEach((record, index) => {
				const date = new Date()
					.toISOString()
					.split(':')[0];

				// Approximate the date for comparison so we don't fail on millisecond comparisons.
				assert.isOk(record.time.startsWith(date), `record[${ index }]].time Date`);
				assert.isEqual('MyLogger', record.name, `record[${ index }].name`);
				assert.isEqual(os.hostname(), record.hostname, `record[${ index }].hostname`);
				assert.isEqual(process.pid, record.pid, `record[${ index }].pid`);
				assert.isEqual(expectedLevels[index], record.level, `record[${ index }].level`);
				const levelString = levelStringLookup.get(record.level);
				assert.isEqual(`${ levelString } record`, record.msg, `record[${ index }].msg`);
			});
		});
	});

	test.describe('with custom fields in the log', (t) => {
		const sandbox = sinon.createSandbox();

		let stream;
		let logger;
		let record;

		t.before((done) => {
			stream = MockStream.create();
			sandbox.spy(stream, 'write');

			logger = Logger.create({
				name: 'MyLogger',
				stream,
				defaultFields: {
					hostname: 'MyHostname',
					location: 'unknown',
					code: 0,
					route: '/admin',
				},
			});

			logger.info('my message', {
				time: '000',
				name: 'xxx',
				hostname: 'foo',
				pid: 10101010,
				level: 1000,
				msg: 'another message',
				location: 'logger-log-records-test',
				code: 42,
				foo: 'bar',
			});

			record = stream.write.firstCall.args[0];

			done();
		});

		t.after((done) => {
			logger.dispose();
			sandbox.restore();
			done();
		});

		t.it('does NOT allow overriding known low level fields', () => {
			const date = new Date()
				.toISOString()
				.split(':')[0];

			assert.isOk(record.time.startsWith(date), 'record.time');
			assert.isEqual('MyLogger', record.name);
			assert.isEqual('MyHostname', record.hostname);
			assert.isEqual(process.pid, record.pid);
			assert.isEqual(30, record.level);
			assert.isEqual('my message', record.msg);

			assert.isEqual('000', record.$time);
			assert.isEqual('xxx', record.$name);
			assert.isEqual('foo', record.$hostname);
			assert.isEqual(10101010, record.$pid);
			assert.isEqual(1000, record.$level);
			assert.isEqual('another message', record.$msg);
		});

		t.it('does NOT allow overriding user defined default fields', () => {
			assert.isEqual('unknown', record.location);
			assert.isEqual(0, record.code);

			assert.isEqual('logger-log-records-test', record.$location);
			assert.isEqual(42, record.$code);
		});

		t.it('allows adding log specific fields', () => {
			assert.isEqual('bar', record.foo);
		});

		t.it('includes user defined defaults', () => {
			assert.isEqual('/admin', record.route);
		});
	});

	test.describe('with user defined serializers', (t) => {
		const sandbox = sinon.createSandbox();

		let stream;
		let logger;
		let record;

		t.before((done) => {
			stream = MockStream.create();
			sandbox.spy(stream, 'write');

			logger = Logger.create({
				name: 'MyLogger',
				stream,
				defaultFields: {
					location: 'unknown',
					code: 0,
					route: '/admin',
				},
				serializers: {
					time(val) {
						return parseInt(val, 10);
					},
					name(val) {
						return val.toUpperCase();
					},
					hostname(val) {
						return `host:${ val }`;
					},
					level(val) {
						return val / 10;
					},
					msg(val) {
						return val.toUpperCase();
					},
					location(val) {
						return val.toUpperCase();
					},
					code(val) {
						return val * 10;
					},
					foo(val) {
						return val.join();
					},
					route(val) {
						return `http://example.com${ val }`;
					},
				},
			});

			logger.info('my message', {
				time: '000',
				name: 'xxx',
				hostname: 'foo',
				pid: 10101010,
				level: 1000,
				msg: 'another message',
				location: 'logger-log-records-test',
				code: 42,
				foo: [ 'b', 'a', 'r' ],
			});

			record = stream.write.firstCall.args[0];

			done();
		});

		t.after((done) => {
			logger.dispose();
			sandbox.restore();
			done();
		});

		t.it('tranforms overwritten fields', () => {
			assert.isEqual(2023, record.time);
			assert.isEqual('MYLOGGER', record.name);
			assert.isEqual(`host:${ os.hostname() }`, record.hostname);
			assert.isEqual(process.pid, record.pid);
			assert.isEqual(3, record.level);
			assert.isEqual('MY MESSAGE', record.msg);
			assert.isEqual('UNKNOWN', record.location);
			assert.isEqual(0, record.code);
		});

		t.it('transforms log specific fields', () => {
			assert.isEqual('b,a,r', record.foo);
		});

		t.it('transforms user defined defaults', () => {
			assert.isEqual('http://example.com/admin', record.route);
		});
	});
};
