'use strict';

const os = require('os');
const { assert } = require('kixx-assert');
const { MockStream } = require('../test-utils');
const ArgumentError = require('../../lib/errors/argument-error');
const { Logger, streams } = require('../../');

const { Errors } = Logger;

module.exports = function runTests(test) {
	test.describe('with default options', (t) => {
		let logger;

		t.before((done) => {
			logger = Logger.create({ name: 'MyLogger' });
			done();
		});

		t.after((done) => {
			logger.dispose();
			done();
		});

		t.it('sets the default level to DEBUG', () => {
			assert.isEqual('debug', logger.level);
		});

		t.it('creates an instance of JsonStdoutStream as a default', () => {
			assert.isEqual(1, logger.streams.size);
			logger.streams.forEach((stream) => {
				assert.isOk(stream instanceof streams.JsonStdout);
			});
		});

		t.it('assigns default fields', () => {
			assert.isEqual('MyLogger', logger.defaultFields.name);
			assert.isNonEmptyString(os.hostname(), 'os.hostname() exists');
			assert.isEqual(os.hostname(), logger.defaultFields.hostname);
			assert.isOk(Number.isInteger(process.pid), 'process.pid exists');
			assert.isEqual(process.pid, logger.defaultFields.pid);
		});

		t.it('does not have any serializers', () => {
			assert.isEmpty(Object.keys(logger.serializers));
		});
	});

	test.describe('with custom options', (t) => {
		let logger;
		const level = Logger.Levels.INFO;
		const stream = MockStream.create();
		// Add the "server" field and overwrite the default "hostname" field.
		const defaultFields = { server: 'my-server', hostname: 'myservername' };
		const serializers = {
			pid() {
				return 'myservername';
			},
		};

		t.before((done) => {
			logger = Logger.create({
				name: 'MyLogger',
				level,
				stream,
				defaultFields,
				serializers,
			});

			done();
		});

		t.after((done) => {
			logger.dispose();
			done();
		});

		t.it('sets the given level', () => {
			assert.isEqual('info', logger.level);
		});

		t.it('has the given stream instance', () => {
			assert.isEqual(1, logger.streams.size);
			logger.streams.forEach((entry) => {
				assert.isEqual(stream, entry);
			});
		});

		t.it('has the given default fields', () => {
			assert.isEqual('MyLogger', logger.defaultFields.name);
			// Overwrites hostname
			assert.isEqual('myservername', logger.defaultFields.hostname);
			assert.isOk(Number.isInteger(process.pid), 'process.pid exists');
			assert.isEqual(process.pid, logger.defaultFields.pid);
			// Adds the new "server" field.
			assert.isEqual('my-server', logger.defaultFields.server);
		});

		t.it('has the given serializers', () => {
			assert.isDefined(serializers && serializers.pid);
			assert.isEqual(serializers.pid, logger.serializers.pid);
		});
	});

	test.it('throws an ArgumentError when a name attribute is not provided', () => {
		const defaultFields = {};
		const stream = MockStream.create();
		const serializers = {};

		let didThrow = false;

		try {
			Logger.create({ defaultFields, stream, serializers });
		} catch (err) {
			didThrow = true;
			assert.isOk(err instanceof Error);
			assert.isOk(err instanceof Errors.ArgumentError);
			assert.isEqual('KixxLoggerArgumentError', err.name);
			assert.isEqual('A logger name is required', err.message);

			// KixxLoggerArgumentError uses a custom stack trace.
			const stack = err.stack.split(os.EOL);
			assert.isEqual('KixxLoggerArgumentError: A logger name is required', stack[0]);
			assert.includes('test/logger/logger-constructor-test.js', stack[1]);
		}

		assert.isOk(didThrow, 'threw the expected error');
	});

	test.it('throws an ArgumentError when an invalid stream is given', () => {
		let didThrow = false;

		try {
			Logger.create({
				name: 'MyLogger',
				stream: {},
			});
		} catch (err) {
			didThrow = true;
			assert.isOk(err instanceof Error);
			assert.isOk(err instanceof Errors.ArgumentError);
			assert.isEqual('KixxLoggerArgumentError', err.name);
			assert.isEqual('A stream must be a Stream instance or provide a Stream API. (Given type "object")', err.message);

			// KixxLoggerArgumentError uses a custom stack trace.
			const stack = err.stack.split(os.EOL);
			assert.isEqual('KixxLoggerArgumentError: A stream must be a Stream instance or provide a Stream API. (Given type "object")', stack[0]);
			assert.includes('test/logger/logger-constructor-test.js', stack[1]);
		}

		assert.isOk(didThrow, 'threw the expected error');
	});

	test.it('throws an ArgumentError when an invalid level string is given', () => {
		let didThrow = false;

		try {
			Logger.create({
				name: 'MyLogger',
				level: '',
			});
		} catch (err) {
			didThrow = true;
			assert.isOk(err instanceof Error);
			assert.isOk(err instanceof Errors.ArgumentError);
			assert.isEqual('KixxLoggerArgumentError', err.name);
			assert.isEqual('Invalid level argument: empty string', err.message);

			// KixxLoggerArgumentError uses a custom stack trace.
			const stack = err.stack.split(os.EOL);
			assert.isEqual('KixxLoggerArgumentError: Invalid level argument: empty string', stack[0]);
			assert.includes('test/logger/logger-constructor-test.js', stack[1]);
		}

		assert.isOk(didThrow, 'threw the expected error');
	});

	test.it('throws an ArgumentError when an invalid level number is given', () => {
		let didThrow = false;

		try {
			Logger.create({
				name: 'MyLogger',
				level: 0,
			});
		} catch (err) {
			didThrow = true;
			assert.isOk(err instanceof Error);
			assert.isOk(err instanceof Errors.ArgumentError);
			assert.isEqual('KixxLoggerArgumentError', err.name);
			assert.isEqual('Invalid level number: 0', err.message);

			// KixxLoggerArgumentError uses a custom stack trace.
			const stack = err.stack.split(os.EOL);
			assert.isEqual('KixxLoggerArgumentError: Invalid level number: 0', stack[0]);
			assert.includes('test/logger/logger-constructor-test.js', stack[1]);
		}

		assert.isOk(didThrow, 'threw the expected error');
	});

	test.it('has static Logger.Levels object', () => {
		assert.isEqual('trace', Logger.Levels.TRACE);
		assert.isEqual('debug', Logger.Levels.DEBUG);
		assert.isEqual('info', Logger.Levels.INFO);
		assert.isEqual('warn', Logger.Levels.WARN);
		assert.isEqual('error', Logger.Levels.ERROR);
		assert.isEqual('fatal', Logger.Levels.FATAL);
	});

	test.it('has static Logger.Errors object', () => {
		assert.isEqual('function', typeof Logger.Errors.ArgumentError);
		assert.isEqual(ArgumentError, Logger.Errors.ArgumentError);
	});
};
