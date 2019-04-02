'use strict';

const { assert } = require('kixx-assert');
const os = require('os');
const sinon = require('sinon');

const {
	Logger,
	createLogger,
	streams,
	serializers } = require('../');


module.exports = (t) => {

	function noop() {
	}

	t.describe('with defaults', (t1) => {
		let logger;
		let stream;

		t1.before((done) => {
			logger = createLogger();

			assert.isEqual(logger.streams.length, 1);

			stream = logger.streams[0];

			sinon.stub(stream, '_transform').callsFake(noop);

			logger.trace('trace level message');
			logger.debug('default fields');
			logger.info('with extra properties', { foo: 'bar', baz: { a: 'z' } });
			logger.warn('yellow and orange');
			logger.error('with an error', { err: new Error('test serializer') });
			logger.fatal('i quit');

			done();
		});

		t1.it('has default level', () => {
			assert.isEqual(Logger.Levels.DEBUG, logger.level);

			assert.isEqual(6, stream._transform.callCount);

			const levels = stream._transform.getCalls().map((call) => {
				return call.args[0].level;
			});

			assert.isEqual(levels[0], Logger.Levels.TRACE);
			assert.isEqual(levels[1], Logger.Levels.DEBUG);
			assert.isEqual(levels[2], Logger.Levels.INFO);
			assert.isEqual(levels[3], Logger.Levels.WARN);
			assert.isEqual(levels[4], Logger.Levels.ERROR);
			assert.isEqual(levels[5], Logger.Levels.FATAL);
		});

		t1.it('has default name', () => {
			assert.isEqual('root', logger.fields.name);

			assert.isEqual(6, stream._transform.callCount);

			const names = stream._transform.getCalls().map((call) => {
				return call.args[0].name;
			});

			names.forEach((name) => {
				assert.isEqual('root', name);
			});
		});

		t1.it('has default hostname', () => {
			const hostname = os.hostname();
			assert.isEqual(hostname, logger.fields.hostname);

			assert.isEqual(6, stream._transform.callCount);

			const hostnames = stream._transform.getCalls().map((call) => {
				return call.args[0].hostnames;
			});

			hostnames.forEach((name) => {
				assert.isEqual(hostname, name);
			});
		});

		t1.it('has default pid', () => {
			const pid = process.pid;
			assert.isNonEmptyString(pid, 'process.pid is a string');
			assert.isEqual(pid, logger.fields.pid);

			assert.isEqual(6, stream._transform.callCount);

			const pids = stream._transform.getCalls().map((call) => {
				return call.args[0].pid;
			});

			pids.forEach((thisPid) => {
				assert.isEqual(pid, thisPid);
			});
		});

		t1.it('has default stream', () => {
			assert.isEqual(1, logger.streams.length);
			const [ thisStream ] = logger.streams;
			assert.isOk(thisStream instanceof streams.JsonStdout);
		});

		t1.it('has default serializers', () => {
			assert.isEqual(1, Object.keys(stream.serializers).length);
			assert.isEqual('function', typeof stream.serializers.err);
			assert.isEqual(serializers.err, stream.serializers.err);
			assert.isEqual(6, stream._transform.callCount);
			const call = stream._transform.getCall(4);
			const [ record ] = call.args;
			const keys = Object.keys(record.err);
			assert.isEqual(4, keys.length);
			assert.isOk(keys.includes('name'));
			assert.isOk(keys.includes('message'));
			assert.isOk(keys.includes('code'));
			assert.isOk(keys.includes('stack'));
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
