'use strict';

const { assert } = require('kixx-assert');
const os = require('os');
const {
	Logger,
	createLogger,
	serializers,
	streams } = require('../');

module.exports = (t) => {
	t.describe('with defaults', (t1) => {
		const logger = createLogger();

		t1.it('has default level', () => {
			assert.isNonEmptyString(logger.level);
			assert.isEqual(Logger.DEBUG, logger.level);
		});

		t1.it('has default name', () => {
			assert.isEqual('root', logger.fields.name);
		});

		t1.it('has default hostname', () => {
			assert.isNonEmptyString(logger.fields.hostname);
			assert.isEqual(os.hostname(), logger.fields.hostname);
		});

		t1.it('has default pid', () => {
			assert.isDefined(logger.fields.pid);
			assert.isEqual(process.pid, logger.fields.pid);
		});

		t1.it('has default stream', () => {
			assert.isEqual(1, logger.streams.length);
			const [ stream ] = logger.streams;
			assert.isOk(stream instanceof streams.JsonStdout);
		});

		t1.it('has default serializers', () => {
			const { err } = logger.serializers;
			assert.isDefined(err);
			assert.isEqual(serializers.err, err);
		});
	});

	t.describe('with options.name', (t1) => {
		const logger = createLogger({
			name: 'My Logger'
		});

		t1.it('has default level', () => {
			assert.isNonEmptyString(logger.level);
			assert.isEqual(Logger.DEBUG, logger.level);
		});

		t1.it('has given name', () => {
			assert.isEqual('My Logger', logger.fields.name);
		});

		t1.it('has default hostname', () => {
			assert.isNonEmptyString(logger.fields.hostname);
			assert.isEqual(os.hostname(), logger.fields.hostname);
		});

		t1.it('has default pid', () => {
			assert.isDefined(logger.fields.pid);
			assert.isEqual(process.pid, logger.fields.pid);
		});

		t1.it('has default stream', () => {
			assert.isEqual(1, logger.streams.length);
			const [ stream ] = logger.streams;
			assert.isOk(stream instanceof streams.JsonStdout);
		});

		t1.it('has default serializers', () => {
			const { err } = logger.serializers;
			assert.isDefined(err);
			assert.isEqual(serializers.err, err);
		});
	});
};
