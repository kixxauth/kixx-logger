'use strict';

const sinon = require('sinon');
const { assert } = require('kixx-assert');
const { MockStream } = require('../test-utils');
const { Logger } = require('../../');

const LEVEL_NUMBERS = Object.freeze({
	TRACE: 10,
	DEBUG: 20,
	INFO: 30,
	WARN: 40,
	ERROR: 50,
	FATAL: 60,
});

module.exports = function runTests(test) {

	test.describe('with level set to TRACE', (t) => {
		const sandbox = sinon.createSandbox();
		let logs;

		t.before((done) => {
			const stream = MockStream.create();

			sandbox.spy(stream, 'write');

			const logger = Logger.create({
				name: 'LevelsLogger',
				level: Logger.Levels.TRACE,
				stream,
			});

			logger.trace('a trace log');
			logger.debug('a debug log');
			logger.info('a info log');
			logger.warn('a warn log');
			logger.error('a error log');
			logger.fatal('a fatal log');

			logs = stream.write.getCalls().map(({ args }) => {
				return args[0];
			});

			done();
		});

		t.after((done) => {
			sandbox.restore();
			done();
		});

		t.it('logs out trace messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.TRACE;
			});

			assert.isNotEmpty(record);
		});

		t.it('logs out debug messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.DEBUG;
			});

			assert.isNotEmpty(record);
		});

		t.it('logs out info messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.INFO;
			});

			assert.isNotEmpty(record);
		});

		t.it('logs out warn messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.WARN;
			});

			assert.isNotEmpty(record);
		});

		t.it('logs out error messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.ERROR;
			});

			assert.isNotEmpty(record);
		});

		t.it('logs out fatal messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.FATAL;
			});

			assert.isNotEmpty(record);
		});
	});

	test.describe('with level set to DEBUG', (t) => {
		const sandbox = sinon.createSandbox();
		let logs;

		t.before((done) => {
			const stream = MockStream.create();

			sandbox.spy(stream, 'write');

			const logger = Logger.create({
				name: 'LevelsLogger',
				level: Logger.Levels.DEBUG,
				stream,
			});

			logger.trace('a trace log');
			logger.debug('a debug log');
			logger.info('a info log');
			logger.warn('a warn log');
			logger.error('a error log');
			logger.fatal('a fatal log');

			logs = stream.write.getCalls().map(({ args }) => {
				return args[0];
			});

			done();
		});

		t.after((done) => {
			sandbox.restore();
			done();
		});

		t.it('does NOT log out trace messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.TRACE;
			});

			assert.isUndefined(record);
		});

		t.it('logs out debug messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.DEBUG;
			});

			assert.isNotEmpty(record);
		});

		t.it('logs out info messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.INFO;
			});

			assert.isNotEmpty(record);
		});

		t.it('logs out warn messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.WARN;
			});

			assert.isNotEmpty(record);
		});

		t.it('logs out error messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.ERROR;
			});

			assert.isNotEmpty(record);
		});

		t.it('logs out fatal messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.FATAL;
			});

			assert.isNotEmpty(record);
		});
	});

	test.describe('with level set to INFO', (t) => {
		const sandbox = sinon.createSandbox();
		let logs;

		t.before((done) => {
			const stream = MockStream.create();

			sandbox.spy(stream, 'write');

			const logger = Logger.create({
				name: 'LevelsLogger',
				level: Logger.Levels.INFO,
				stream,
			});

			logger.trace('a trace log');
			logger.debug('a debug log');
			logger.info('a info log');
			logger.warn('a warn log');
			logger.error('a error log');
			logger.fatal('a fatal log');

			logs = stream.write.getCalls().map(({ args }) => {
				return args[0];
			});

			done();
		});

		t.after((done) => {
			sandbox.restore();
			done();
		});

		t.it('does NOT log out trace messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.TRACE;
			});

			assert.isUndefined(record);
		});

		t.it('does NOT log out debug messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.DEBUG;
			});

			assert.isUndefined(record);
		});

		t.it('logs out info messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.INFO;
			});

			assert.isNotEmpty(record);
		});

		t.it('logs out warn messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.WARN;
			});

			assert.isNotEmpty(record);
		});

		t.it('logs out error messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.ERROR;
			});

			assert.isNotEmpty(record);
		});

		t.it('logs out fatal messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.FATAL;
			});

			assert.isNotEmpty(record);
		});
	});

	test.describe('with level set to WARN', (t) => {
		const sandbox = sinon.createSandbox();
		let logs;

		t.before((done) => {
			const stream = MockStream.create();

			sandbox.spy(stream, 'write');

			const logger = Logger.create({
				name: 'LevelsLogger',
				level: Logger.Levels.WARN,
				stream,
			});

			logger.trace('a trace log');
			logger.debug('a debug log');
			logger.info('a info log');
			logger.warn('a warn log');
			logger.error('a error log');
			logger.fatal('a fatal log');

			logs = stream.write.getCalls().map(({ args }) => {
				return args[0];
			});

			done();
		});

		t.after((done) => {
			sandbox.restore();
			done();
		});

		t.it('does NOT log out trace messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.TRACE;
			});

			assert.isUndefined(record);
		});

		t.it('does NOT log out debug messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.DEBUG;
			});

			assert.isUndefined(record);
		});

		t.it('does NOT log out info messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.INFO;
			});

			assert.isUndefined(record);
		});

		t.it('logs out warn messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.WARN;
			});

			assert.isNotEmpty(record);
		});

		t.it('logs out error messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.ERROR;
			});

			assert.isNotEmpty(record);
		});

		t.it('logs out fatal messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.FATAL;
			});

			assert.isNotEmpty(record);
		});
	});

	test.describe('with level set to ERROR', (t) => {
		const sandbox = sinon.createSandbox();
		let logs;

		t.before((done) => {
			const stream = MockStream.create();

			sandbox.spy(stream, 'write');

			const logger = Logger.create({
				name: 'LevelsLogger',
				level: Logger.Levels.ERROR,
				stream,
			});

			logger.trace('a trace log');
			logger.debug('a debug log');
			logger.info('a info log');
			logger.warn('a warn log');
			logger.error('a error log');
			logger.fatal('a fatal log');

			logs = stream.write.getCalls().map(({ args }) => {
				return args[0];
			});

			done();
		});

		t.after((done) => {
			sandbox.restore();
			done();
		});

		t.it('does NOT log out trace messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.TRACE;
			});

			assert.isUndefined(record);
		});

		t.it('does NOT log out debug messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.DEBUG;
			});

			assert.isUndefined(record);
		});

		t.it('does NOT log out info messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.INFO;
			});

			assert.isUndefined(record);
		});

		t.it('does NOT log out warn messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.WARN;
			});

			assert.isUndefined(record);
		});

		t.it('logs out error messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.ERROR;
			});

			assert.isNotEmpty(record);
		});

		t.it('logs out fatal messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.FATAL;
			});

			assert.isNotEmpty(record);
		});
	});

	test.describe('with level set to FATAL', (t) => {
		const sandbox = sinon.createSandbox();
		let logs;

		t.before((done) => {
			const stream = MockStream.create();

			sandbox.spy(stream, 'write');

			const logger = Logger.create({
				name: 'LevelsLogger',
				level: Logger.Levels.FATAL,
				stream,
			});

			logger.trace('a trace log');
			logger.debug('a debug log');
			logger.info('a info log');
			logger.warn('a warn log');
			logger.error('a error log');
			logger.fatal('a fatal log');

			logs = stream.write.getCalls().map(({ args }) => {
				return args[0];
			});

			done();
		});

		t.after((done) => {
			sandbox.restore();
			done();
		});

		t.it('does NOT log out trace messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.TRACE;
			});

			assert.isUndefined(record);
		});

		t.it('does NOT log out debug messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.DEBUG;
			});

			assert.isUndefined(record);
		});

		t.it('does NOT log out info messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.INFO;
			});

			assert.isUndefined(record);
		});

		t.it('does NOT log out warn messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.WARN;
			});

			assert.isUndefined(record);
		});

		t.it('does NOT log out error messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.ERROR;
			});

			assert.isUndefined(record);
		});

		t.it('logs out fatal messages', () => {
			const record = logs.find(({ level }) => {
				return level === LEVEL_NUMBERS.FATAL;
			});

			assert.isNotEmpty(record);
		});
	});
};
