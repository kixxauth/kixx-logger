'use strict';

const os = require('os');
const sinon = require('sinon');
const { assert } = require('kixx-assert');
const { Logger } = require('../../');
const { MockStream } = require('../test-utils');

const { Errors } = Logger;

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

module.exports = function runTests(test) {
	test.it('accepts streams without an init() method', () => {
		const logger = Logger.create({ name: 'root' });

		const stream = {
			write() {
			},
		};

		// Adding the stream without an init() method should not throw an error.
		logger.addStream(stream);
	});

	test.describe('when a stream is added more than once', (t) => {
		const sandbox = sinon.createSandbox();
		let stream;
		let logger;
		let childLogger;

		t.before((done) => {
			logger = Logger.create({ name: 'root' });
			childLogger = logger.createChild('child');

			stream = MockStream.create();
			sandbox.spy(stream, 'init');

			logger.addStream(stream);
			childLogger.addStream(stream);
			logger.addStream(stream);
			childLogger.addStream(stream);

			done();
		});

		t.after((done) => {
			sandbox.restore();
			done();
		});

		t.it('does not reinitialize it', () => {
			assert.isEqual(1, stream.init.callCount);
		});

		t.it('only adds it to each logger once', () => {
			// Each logger also includes the default stream.
			assert.isEqual(2, logger.streams.size);
			assert.isEqual(2, childLogger.streams.size);
		});
	});

	test.describe('with default level', (t) => {
		let stream;
		let levelBefore;

		t.before((done) => {
			const logger = Logger.create({ name: 'root' });
			stream = MockStream.create();
			levelBefore = stream.level;
			logger.addStream(stream);
			done();
		});

		t.it('sets level and levelN properties', () => {
			assert.isUndefined(levelBefore);
			assert.isEqual(LEVEL_STRINGS.TRACE, stream.level);
			assert.isEqual(LEVEL_NUMBERS.TRACE, stream.levelN);
		});
	});

	test.describe('with given level', (t) => {
		let stream;
		let levelBefore;

		t.before((done) => {
			const logger = Logger.create({ name: 'root' });
			stream = MockStream.create();
			levelBefore = stream.level;
			logger.addStream(stream, Logger.Levels.ERROR);
			done();
		});

		t.it('sets level and levelN properties', () => {
			assert.isUndefined(levelBefore);
			assert.isEqual(LEVEL_STRINGS.ERROR, stream.level);
			assert.isEqual(LEVEL_NUMBERS.ERROR, stream.levelN);
		});
	});

	test.it('adds the stream to all the child loggers', () => {
		const level0Logger = Logger.create({ name: 'root' });
		const level1Logger = level0Logger.createChild('level1');
		const level2Logger = level1Logger.createChild('level2');
		const stream = MockStream.create();

		level0Logger.addStream(stream);

		assert.isOk(level0Logger.streams.has(stream));
		assert.isOk(level1Logger.streams.has(stream));
		assert.isOk(level2Logger.streams.has(stream));
	});

	test.it('catches an invalid stream and throws an ArgumentError', () => {
		const logger = Logger.create({ name: 'root' });
		let didThrow = false;

		try {
			logger.addStream({});
		} catch (err) {
			didThrow = true;
			assert.isDefined(err);
			assert.isOk(err instanceof Error);
			assert.isOk(err instanceof Errors.ArgumentError);
			assert.isEqual('KixxLoggerArgumentError', err.name);
			assert.isEqual('A stream must be a Stream instance or provide a Stream API. (Given type "object")', err.message);

			// KixxLoggerArgumentError uses a custom stack trace.
			const stack = err.stack.split(os.EOL);
			assert.isEqual('KixxLoggerArgumentError: A stream must be a Stream instance or provide a Stream API. (Given type "object")', stack[0]);
			assert.includes('test/logger/logger-add-stream-test.js', stack[1]);
		}

		assert.isOk(didThrow, 'threw the expected error');
	});

	test.it('catches an invalid number level and throws an ArgumentError', () => {
		const logger = Logger.create({ name: 'root' });
		const stream = MockStream.create();
		let didThrow = false;

		try {
			logger.addStream(stream, 0);
		} catch (err) {
			didThrow = true;
			assert.isDefined(err);
			assert.isOk(err instanceof Error);
			assert.isOk(err instanceof Errors.ArgumentError);
			assert.isEqual('KixxLoggerArgumentError', err.name);
			assert.isEqual('Invalid level number: 0', err.message);

			// KixxLoggerArgumentError uses a custom stack trace.
			const stack = err.stack.split(os.EOL);
			assert.isEqual('KixxLoggerArgumentError: Invalid level number: 0', stack[0]);
			assert.includes('test/logger/logger-add-stream-test.js', stack[1]);
		}

		assert.isOk(didThrow, 'threw the expected error');
	});

	test.it('catches an invalid string level and throws an ArgumentError', () => {
		const logger = Logger.create({ name: 'root' });
		const stream = MockStream.create();
		let didThrow = false;

		try {
			logger.addStream(stream, 'foo');
		} catch (err) {
			didThrow = true;
			assert.isDefined(err);
			assert.isOk(err instanceof Error);
			assert.isOk(err instanceof Errors.ArgumentError);
			assert.isEqual('KixxLoggerArgumentError', err.name);
			assert.isEqual('Invalid level string: "foo"', err.message);

			// KixxLoggerArgumentError uses a custom stack trace.
			const stack = err.stack.split(os.EOL);
			assert.isEqual('KixxLoggerArgumentError: Invalid level string: "foo"', stack[0]);
			assert.includes('test/logger/logger-add-stream-test.js', stack[1]);
		}

		assert.isOk(didThrow, 'threw the expected error');
	});

	test.it('catches non-integer number level and throws an ArgumentError', () => {
		const logger = Logger.create({ name: 'root' });
		const stream = MockStream.create();
		let didThrow = false;

		try {
			logger.addStream(stream, 2.2);
		} catch (err) {
			didThrow = true;
			assert.isDefined(err);
			assert.isOk(err instanceof Error);
			assert.isOk(err instanceof Errors.ArgumentError);
			assert.isEqual('KixxLoggerArgumentError', err.name);
			assert.isEqual('Invalid level number: 2.2', err.message);

			// KixxLoggerArgumentError uses a custom stack trace.
			const stack = err.stack.split(os.EOL);
			assert.isEqual('KixxLoggerArgumentError: Invalid level number: 2.2', stack[0]);
			assert.includes('test/logger/logger-add-stream-test.js', stack[1]);
		}

		assert.isOk(didThrow, 'threw the expected error');
	});

	test.it('catches an empty string level and throws an ArgumentError', () => {
		const logger = Logger.create({ name: 'root' });
		const stream = MockStream.create();
		let didThrow = false;

		try {
			logger.addStream(stream, '');
		} catch (err) {
			didThrow = true;
			assert.isDefined(err);
			assert.isOk(err instanceof Error);
			assert.isOk(err instanceof Errors.ArgumentError);
			assert.isEqual('KixxLoggerArgumentError', err.name);
			assert.isEqual('Invalid level argument: empty string', err.message);

			// KixxLoggerArgumentError uses a custom stack trace.
			const stack = err.stack.split(os.EOL);
			assert.isEqual('KixxLoggerArgumentError: Invalid level argument: empty string', stack[0]);
			assert.includes('test/logger/logger-add-stream-test.js', stack[1]);
		}

		assert.isOk(didThrow, 'threw the expected error');
	});
};
