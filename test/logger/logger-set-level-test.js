'use strict';

const os = require('os');
const { assert } = require('kixx-assert');
const { Logger } = require('../../');

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

	test.describe('when setting the level to TRACE', (t) => {
		let loggerLevel0;
		let loggerLevel1a;
		let loggerLevel1b;
		let loggerLevel2;

		t.before((done) => {
			loggerLevel0 = Logger.create({ name: 'root' });
			loggerLevel1a = loggerLevel0.createChild('application');
			loggerLevel1b = loggerLevel0.createChild('database');
			loggerLevel2 = loggerLevel1a.createChild('component');

			loggerLevel0.setLevel(Logger.Levels.TRACE);
			done();
		});

		t.after((done) => {
			// Dispose the logger to avoid event emitter memory leak warnings.
			loggerLevel0.dispose();
			done();
		});

		t.it('sets the `level` property', () => {
			assert.isEqual(LEVEL_STRINGS.TRACE, loggerLevel0.level);
		});

		t.it('sets the level integer', () => {
			assert.isEqual(LEVEL_NUMBERS.TRACE, loggerLevel0.levelN);
		});

		t.it('sets the `level` property on each child logger', () => {
			assert.isEqual(LEVEL_STRINGS.TRACE, loggerLevel1a.level);
			assert.isEqual(LEVEL_STRINGS.TRACE, loggerLevel1b.level);
			assert.isEqual(LEVEL_STRINGS.TRACE, loggerLevel2.level);
		});

		t.it('sets the level integer on each child logger', () => {
			assert.isEqual(LEVEL_NUMBERS.TRACE, loggerLevel1a.levelN);
			assert.isEqual(LEVEL_NUMBERS.TRACE, loggerLevel1b.levelN);
			assert.isEqual(LEVEL_NUMBERS.TRACE, loggerLevel2.levelN);
		});
	});

	test.describe('when setting the level to DEBUG', (t) => {
		let loggerLevel0;
		let loggerLevel1a;
		let loggerLevel1b;
		let loggerLevel2;

		t.before((done) => {
			loggerLevel0 = Logger.create({ name: 'root' });
			loggerLevel1a = loggerLevel0.createChild('application');
			loggerLevel1b = loggerLevel0.createChild('database');
			loggerLevel2 = loggerLevel1a.createChild('component');

			loggerLevel0.setLevel(Logger.Levels.DEBUG);
			done();
		});

		t.after((done) => {
			// Dispose the logger to avoid event emitter memory leak warnings.
			loggerLevel0.dispose();
			done();
		});

		t.it('sets the `level` property', () => {
			assert.isEqual(LEVEL_STRINGS.DEBUG, loggerLevel0.level);
		});

		t.it('sets the level integer', () => {
			assert.isEqual(LEVEL_NUMBERS.DEBUG, loggerLevel0.levelN);
		});

		t.it('sets the `level` property on each child logger', () => {
			assert.isEqual(LEVEL_STRINGS.DEBUG, loggerLevel1a.level);
			assert.isEqual(LEVEL_STRINGS.DEBUG, loggerLevel1b.level);
			assert.isEqual(LEVEL_STRINGS.DEBUG, loggerLevel2.level);
		});

		t.it('sets the level integer on each child logger', () => {
			assert.isEqual(LEVEL_NUMBERS.DEBUG, loggerLevel1a.levelN);
			assert.isEqual(LEVEL_NUMBERS.DEBUG, loggerLevel1b.levelN);
			assert.isEqual(LEVEL_NUMBERS.DEBUG, loggerLevel2.levelN);
		});
	});

	test.describe('when setting the level to INFO', (t) => {
		let loggerLevel0;
		let loggerLevel1a;
		let loggerLevel1b;
		let loggerLevel2;

		t.before((done) => {
			loggerLevel0 = Logger.create({ name: 'root' });
			loggerLevel1a = loggerLevel0.createChild('application');
			loggerLevel1b = loggerLevel0.createChild('database');
			loggerLevel2 = loggerLevel1a.createChild('component');

			loggerLevel0.setLevel(Logger.Levels.INFO);
			done();
		});

		t.after((done) => {
			// Dispose the logger to avoid event emitter memory leak warnings.
			loggerLevel0.dispose();
			done();
		});

		t.it('sets the `level` property', () => {
			assert.isEqual(LEVEL_STRINGS.INFO, loggerLevel0.level);
		});

		t.it('sets the level integer', () => {
			assert.isEqual(LEVEL_NUMBERS.INFO, loggerLevel0.levelN);
		});

		t.it('sets the `level` property on each child logger', () => {
			assert.isEqual(LEVEL_STRINGS.INFO, loggerLevel1a.level);
			assert.isEqual(LEVEL_STRINGS.INFO, loggerLevel1b.level);
			assert.isEqual(LEVEL_STRINGS.INFO, loggerLevel2.level);
		});

		t.it('sets the level integer on each child logger', () => {
			assert.isEqual(LEVEL_NUMBERS.INFO, loggerLevel1a.levelN);
			assert.isEqual(LEVEL_NUMBERS.INFO, loggerLevel1b.levelN);
			assert.isEqual(LEVEL_NUMBERS.INFO, loggerLevel2.levelN);
		});
	});

	test.describe('when setting the level to WARN', (t) => {
		let loggerLevel0;
		let loggerLevel1a;
		let loggerLevel1b;
		let loggerLevel2;

		t.before((done) => {
			loggerLevel0 = Logger.create({ name: 'root' });
			loggerLevel1a = loggerLevel0.createChild('application');
			loggerLevel1b = loggerLevel0.createChild('database');
			loggerLevel2 = loggerLevel1a.createChild('component');

			loggerLevel0.setLevel(Logger.Levels.WARN);
			done();
		});

		t.after((done) => {
			// Dispose the logger to avoid event emitter memory leak warnings.
			loggerLevel0.dispose();
			done();
		});

		t.it('sets the `level` property', () => {
			assert.isEqual(LEVEL_STRINGS.WARN, loggerLevel0.level);
		});

		t.it('sets the level integer', () => {
			assert.isEqual(LEVEL_NUMBERS.WARN, loggerLevel0.levelN);
		});

		t.it('sets the `level` property on each child logger', () => {
			assert.isEqual(LEVEL_STRINGS.WARN, loggerLevel1a.level);
			assert.isEqual(LEVEL_STRINGS.WARN, loggerLevel1b.level);
			assert.isEqual(LEVEL_STRINGS.WARN, loggerLevel2.level);
		});

		t.it('sets the level integer on each child logger', () => {
			assert.isEqual(LEVEL_NUMBERS.WARN, loggerLevel1a.levelN);
			assert.isEqual(LEVEL_NUMBERS.WARN, loggerLevel1b.levelN);
			assert.isEqual(LEVEL_NUMBERS.WARN, loggerLevel2.levelN);
		});
	});

	test.describe('when setting the level to ERROR', (t) => {
		let loggerLevel0;
		let loggerLevel1a;
		let loggerLevel1b;
		let loggerLevel2;

		t.before((done) => {
			loggerLevel0 = Logger.create({ name: 'root' });
			loggerLevel1a = loggerLevel0.createChild('application');
			loggerLevel1b = loggerLevel0.createChild('database');
			loggerLevel2 = loggerLevel1a.createChild('component');

			loggerLevel0.setLevel(Logger.Levels.ERROR);
			done();
		});

		t.after((done) => {
			// Dispose the logger to avoid event emitter memory leak warnings.
			loggerLevel0.dispose();
			done();
		});

		t.it('sets the `level` property', () => {
			assert.isEqual(LEVEL_STRINGS.ERROR, loggerLevel0.level);
		});

		t.it('sets the level integer', () => {
			assert.isEqual(LEVEL_NUMBERS.ERROR, loggerLevel0.levelN);
		});

		t.it('sets the `level` property on each child logger', () => {
			assert.isEqual(LEVEL_STRINGS.ERROR, loggerLevel1a.level);
			assert.isEqual(LEVEL_STRINGS.ERROR, loggerLevel1b.level);
			assert.isEqual(LEVEL_STRINGS.ERROR, loggerLevel2.level);
		});

		t.it('sets the level integer on each child logger', () => {
			assert.isEqual(LEVEL_NUMBERS.ERROR, loggerLevel1a.levelN);
			assert.isEqual(LEVEL_NUMBERS.ERROR, loggerLevel1b.levelN);
			assert.isEqual(LEVEL_NUMBERS.ERROR, loggerLevel2.levelN);
		});
	});

	test.describe('when setting the level to FATAL', (t) => {
		let loggerLevel0;
		let loggerLevel1a;
		let loggerLevel1b;
		let loggerLevel2;

		t.before((done) => {
			loggerLevel0 = Logger.create({ name: 'root' });
			loggerLevel1a = loggerLevel0.createChild('application');
			loggerLevel1b = loggerLevel0.createChild('database');
			loggerLevel2 = loggerLevel1a.createChild('component');

			loggerLevel0.setLevel(Logger.Levels.FATAL);
			done();
		});

		t.after((done) => {
			// Dispose the logger to avoid event emitter memory leak warnings.
			loggerLevel0.dispose();
			done();
		});

		t.it('sets the `level` property', () => {
			assert.isEqual(LEVEL_STRINGS.FATAL, loggerLevel0.level);
		});

		t.it('sets the level integer', () => {
			assert.isEqual(LEVEL_NUMBERS.FATAL, loggerLevel0.levelN);
		});

		t.it('sets the `level` property on each child logger', () => {
			assert.isEqual(LEVEL_STRINGS.FATAL, loggerLevel1a.level);
			assert.isEqual(LEVEL_STRINGS.FATAL, loggerLevel1b.level);
			assert.isEqual(LEVEL_STRINGS.FATAL, loggerLevel2.level);
		});

		t.it('sets the level integer on each child logger', () => {
			assert.isEqual(LEVEL_NUMBERS.FATAL, loggerLevel1a.levelN);
			assert.isEqual(LEVEL_NUMBERS.FATAL, loggerLevel1b.levelN);
			assert.isEqual(LEVEL_NUMBERS.FATAL, loggerLevel2.levelN);
		});
	});

	test.it('catches an invalid number and throws an ArgumentError', () => {
		const logger = Logger.create({ name: 'root' });
		let didThrow = false;

		try {
			logger.setLevel(0);
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
			assert.includes('test/logger/logger-set-level-test.js', stack[1]);
		}

		// Dispose the logger to avoid event emitter memory leak warnings.
		logger.dispose();

		assert.isOk(didThrow, 'threw the expected error');
	});

	test.it('catches an invalid string and throws an ArgumentError', () => {
		const logger = Logger.create({ name: 'root' });
		let didThrow = false;

		try {
			logger.setLevel('foo');
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
			assert.includes('test/logger/logger-set-level-test.js', stack[1]);
		}

		// Dispose the logger to avoid event emitter memory leak warnings.
		logger.dispose();

		assert.isOk(didThrow, 'threw the expected error');
	});

	test.it('catches non-integer number and throws an ArgumentError', () => {
		const logger = Logger.create({ name: 'root' });
		let didThrow = false;

		try {
			logger.setLevel(2.2);
		} catch (err) {
			didThrow = true;
			assert.isDefined(err);
			assert.isOk(err instanceof Error);
			assert.isOk(err instanceof Errors.ArgumentError);
			assert.isEqual('KixxLoggerArgumentError', err.name);
			assert.isEqual('Invalid level argument: 2.2. Must be an integer or string', err.message);

			// KixxLoggerArgumentError uses a custom stack trace.
			const stack = err.stack.split(os.EOL);
			assert.isEqual('KixxLoggerArgumentError: Invalid level argument: 2.2. Must be an integer or string', stack[0]);
			assert.includes('test/logger/logger-set-level-test.js', stack[1]);
		}

		// Dispose the logger to avoid event emitter memory leak warnings.
		logger.dispose();

		assert.isOk(didThrow, 'threw the expected error');
	});

	test.it('catches an empty string and throws an ArgumentError', () => {
		const logger = Logger.create({ name: 'root' });
		let didThrow = false;

		try {
			logger.setLevel('');
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
			assert.includes('test/logger/logger-set-level-test.js', stack[1]);
		}

		// Dispose the logger to avoid event emitter memory leak warnings.
		logger.dispose();

		assert.isOk(didThrow, 'threw the expected error');
	});

	test.it('catches undefined and throws an ArgumentError', () => {
		const logger = Logger.create({ name: 'root' });
		let didThrow = false;

		try {
			logger.setLevel();
		} catch (err) {
			didThrow = true;
			assert.isDefined(err);
			assert.isOk(err instanceof Error);
			assert.isOk(err instanceof Errors.ArgumentError);
			assert.isEqual('KixxLoggerArgumentError', err.name);
			assert.isEqual('Invalid level argument: undefined. Must be an integer or string', err.message);

			// KixxLoggerArgumentError uses a custom stack trace.
			const stack = err.stack.split(os.EOL);
			assert.isEqual('KixxLoggerArgumentError: Invalid level argument: undefined. Must be an integer or string', stack[0]);
			assert.includes('test/logger/logger-set-level-test.js', stack[1]);
		}

		// Dispose the logger to avoid event emitter memory leak warnings.
		logger.dispose();

		assert.isOk(didThrow, 'threw the expected error');
	});
};
