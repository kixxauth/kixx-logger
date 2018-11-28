'use strict';

const { assert } = require('kixx-assert');
const os = require('os');
const Sinon = require('sinon');

const {
	Logger,
	createLogger,
	streams } = require('../');

const { EOL } = os;

function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(null);
		}, ms);
	});
}

module.exports = (t) => {
	t.describe('with defaults', (t1) => {
		const sandbox = Sinon.createSandbox();
		let logger;

		t1.before((done) => {
			sandbox.stub(process.stdout, 'write').callsFake(() => {});

			logger = createLogger();

			logger.trace('trace level message');
			logger.debug('default fields');
			logger.info('additional fields', { err: new Error('test serializer') });

			// Introduce some delay to catch the async call.
			return delay(10).then(done);
		});

		t1.after((done) => {
			sandbox.restore();
			done();
		});

		t1.it('has default level', () => {
			assert.isNonEmptyString(logger.level);
			assert.isEqual(Logger.DEBUG, logger.level);

			assert.isEqual(2, process.stdout.write.callCount);

			const calls = process.stdout.write.getCalls();

			const level1 = calls[0].args[0].split(' - ')[1];
			const level2 = calls[1].args[0].split(' - ')[1];

			assert.isEqual('DEBUG (20)', level1);
			assert.isEqual('INFO (30)', level2);
		});

		t1.it('has default name', () => {
			assert.isEqual('root', logger.fields.name);

			assert.isEqual(2, process.stdout.write.callCount);

			const calls = process.stdout.write.getCalls();

			const name1 = calls[0].args[0].split(' - ')[2];
			const name2 = calls[1].args[0].split(' - ')[2];

			assert.isEqual('root', name1);
			assert.isEqual('root', name2);
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
			const call = process.stdout.write.getCall(1);

			const lines = call.args[0].split(EOL);

			assert.isEqual('{ err: ', lines[1]);
			assert.isEqual("   { name: 'Error',", lines[2]); // eslint-disable-line quotes
			assert.isEqual('     code: undefined,', lines[3]);
			assert.isOk(lines[4].startsWith("     stack: 'Error: test serializer")); // eslint-disable-line quotes
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
	});

	t.describe('with options.level', (t1) => {
		const logger = createLogger({
			level: Logger.ERROR
		});

		t1.it('has given level', () => {
			assert.isNonEmptyString(logger.level);
			assert.isEqual(Logger.ERROR, logger.level);
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
	});

	t.describe('with options.stream', (t1) => {
		const myStream = {};

		const logger = createLogger({
			stream: myStream
		});

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

		t1.it('has given stream', () => {
			assert.isEqual(1, logger.streams.length);
			const [ stream ] = logger.streams;
			assert.isEqual(myStream, stream);
		});
	});

	t.describe('with options.serializers', (t1) => {
		const foo = () => {};
		const logger = createLogger({
			serializers: { foo }
		});

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

		t1.it('has given serializers', () => {
			assert.isUndefined(logger.serializers.err);
			assert.isDefined(logger.serializers.foo);
			assert.isEqual(logger.serializers.foo, foo);
		});
	});
};
