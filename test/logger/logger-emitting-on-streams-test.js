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
	test.describe('with a stream for each level', (t) => {
		const sandbox = sinon.createSandbox();
		const streams = {
			trace: MockStream.create(),
			debug: MockStream.create(),
			info: MockStream.create(),
			warn: MockStream.create(),
			error: MockStream.create(),
			fatal: MockStream.create(),
		};

		t.before((done) => {
			sandbox.spy(streams.trace, 'write');
			sandbox.spy(streams.debug, 'write');
			sandbox.spy(streams.info, 'write');
			sandbox.spy(streams.warn, 'write');
			sandbox.spy(streams.error, 'write');
			sandbox.spy(streams.fatal, 'write');

			const logger = Logger.create({
				name: 'LevelsLogger',
				level: Logger.Levels.TRACE,
				stream: streams.trace,
			});

			logger.addStream(streams.debug, Logger.Levels.DEBUG);
			logger.addStream(streams.info, Logger.Levels.INFO);
			logger.addStream(streams.warn, Logger.Levels.WARN);
			logger.addStream(streams.error, Logger.Levels.ERROR);
			logger.addStream(streams.fatal, Logger.Levels.FATAL);

			logger.trace('a trace log');
			logger.debug('a debug log');
			logger.info('a info log');
			logger.log('a log log');
			logger.warn('a warn log');
			logger.error('a error log');
			logger.fatal('a fatal log');

			done();
		});

		t.after((done) => {
			sandbox.restore();
			done();
		});

		t.it('calls the trace stream for appropriate levels', () => {
			assert.isEqual(7, streams.trace.write.callCount);

			const records = streams.trace.write.getCalls().map(({ args }) => {
				return args[0];
			});

			assert.isEqual(LEVEL_NUMBERS.TRACE, records[0].level);
			assert.isEqual(LEVEL_NUMBERS.DEBUG, records[1].level);
			assert.isEqual(LEVEL_NUMBERS.INFO, records[2].level);
			assert.isEqual(LEVEL_NUMBERS.INFO, records[3].level);
			assert.isEqual(LEVEL_NUMBERS.WARN, records[4].level);
			assert.isEqual(LEVEL_NUMBERS.ERROR, records[5].level);
			assert.isEqual(LEVEL_NUMBERS.FATAL, records[6].level);
		});

		t.it('calls the debug stream for appropriate levels', () => {
			assert.isEqual(6, streams.debug.write.callCount);

			const records = streams.debug.write.getCalls().map(({ args }) => {
				return args[0];
			});

			assert.isEqual(LEVEL_NUMBERS.DEBUG, records[0].level);
			assert.isEqual(LEVEL_NUMBERS.INFO, records[1].level);
			assert.isEqual(LEVEL_NUMBERS.INFO, records[2].level);
			assert.isEqual(LEVEL_NUMBERS.WARN, records[3].level);
			assert.isEqual(LEVEL_NUMBERS.ERROR, records[4].level);
			assert.isEqual(LEVEL_NUMBERS.FATAL, records[5].level);
		});

		t.it('calls the info stream for appropriate levels', () => {
			assert.isEqual(5, streams.info.write.callCount);

			const records = streams.info.write.getCalls().map(({ args }) => {
				return args[0];
			});

			assert.isEqual(LEVEL_NUMBERS.INFO, records[0].level);
			assert.isEqual(LEVEL_NUMBERS.INFO, records[1].level);
			assert.isEqual(LEVEL_NUMBERS.WARN, records[2].level);
			assert.isEqual(LEVEL_NUMBERS.ERROR, records[3].level);
			assert.isEqual(LEVEL_NUMBERS.FATAL, records[4].level);
		});

		t.it('calls the warn stream for appropriate levels', () => {
			assert.isEqual(3, streams.warn.write.callCount);

			const records = streams.warn.write.getCalls().map(({ args }) => {
				return args[0];
			});

			assert.isEqual(LEVEL_NUMBERS.WARN, records[0].level);
			assert.isEqual(LEVEL_NUMBERS.ERROR, records[1].level);
			assert.isEqual(LEVEL_NUMBERS.FATAL, records[2].level);
		});

		t.it('calls the error stream for appropriate levels', () => {
			assert.isEqual(2, streams.error.write.callCount);

			const records = streams.error.write.getCalls().map(({ args }) => {
				return args[0];
			});

			assert.isEqual(LEVEL_NUMBERS.ERROR, records[0].level);
			assert.isEqual(LEVEL_NUMBERS.FATAL, records[1].level);
		});

		t.it('calls the fatal stream for appropriate levels', () => {
			assert.isEqual(1, streams.fatal.write.callCount);

			const records = streams.fatal.write.getCalls().map(({ args }) => {
				return args[0];
			});

			assert.isEqual(LEVEL_NUMBERS.FATAL, records[0].level);
		});
	});
};
