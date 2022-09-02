'use strict';

const os = require('os');
const { assert } = require('kixx-assert');
const { Logger } = require('../../');
const { MockStream } = require('../test-utils');

const { Errors } = Logger;

module.exports = function runTests(test) {

	test.describe('when a name attribute is not provided', (t) => {

		t.it('throws an ArgumentError', () => {
			const logger = Logger.create({ name: 'root' });
			let didThrow = false;

			try {
				logger.createChild();
			} catch (err) {
				didThrow = true;
				assert.isOk(err instanceof Error);
				assert.isOk(err instanceof Errors.ArgumentError);
				assert.isEqual('KixxLoggerArgumentError', err.name);
				assert.isEqual('A child logger name is required', err.message);

				// KixxLoggerArgumentError uses a custom stack trace.
				const stack = err.stack.split(os.EOL);
				assert.isEqual('KixxLoggerArgumentError: A child logger name is required', stack[0]);
				assert.includes('test/logger/logger-create-child-test.js', stack[1]);
			}

			assert.isOk(didThrow, 'threw the expected error');
		});
	});

	test.describe('when correct values are provided', (t) => {
		let stream;
		let childLogger;

		t.before((done) => {
			stream = MockStream.create();

			const logger = Logger.create({
				name: 'root',
				level: Logger.Levels.INFO,
				stream,
				defaultFields: { application: 'MyApp' },
				serializers: {
					hostname() {
						return 'myappname';
					},
				},
			});

			childLogger = logger.createChild({ name: 'ComponentName' });
			done();
		});

		t.it('combines the name with the parent name', () => {
			assert.isEqual('root:ComponentName', childLogger.name);
		});

		t.it('inherits the parent level', () => {
			assert.isEqual('info', childLogger.level);
			assert.isEqual(30, childLogger.levelN);
		});

		t.it('inherits the parent default fields, changing the name appropriately', () => {
			const { defaultFields } = childLogger;

			assert.isEqual('root:ComponentName', defaultFields.name);
			assert.isEqual(os.hostname(), defaultFields.hostname);
			assert.isEqual(process.pid, defaultFields.pid);
			assert.isEqual('MyApp', defaultFields.application);
		});

		t.it('inherits the parent serializers', () => {
			const { serializers } = childLogger;

			assert.isEqual('function', typeof serializers.hostname);
		});

		t.it('inherits the parent streams', () => {
			const { streams } = childLogger;

			assert.isEqual(1, streams.size);

			streams.forEach((entry) => {
				assert.isEqual(stream, entry);
			});
		});
	});
};
