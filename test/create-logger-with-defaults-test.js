'use strict';

const { assert } = require('kixx-assert');
const os = require('os');
const sinon = require('sinon');

const {
	Logger,
	createLogger,
	streams,
	serializers } = require('../');

module.exports = (test) => {

	function noop() {
	}

	function identity(x) {
		return x;
	}


	test.describe('createLogger() with defaults', (t) => {
		let logger;
		let stream;
		const err = {};
		const hostname = os.hostname();
		const { pid } = process;

		t.before((done) => {
			Object.keys(serializers).forEach((key) => {
				sinon.spy(serializers, key);
			});

			logger = createLogger();

			assert.isEqual(1, logger.streams.length);
			stream = logger.streams[0];

			sinon.stub(stream, 'write').callsFake(noop);

			Object.keys(logger.serializers).forEach((key) => {
				sinon.stub(logger.serializers, key).callsFake(identity);
			});

			logger.trace('trace level message');
			logger.debug('default fields');
			logger.info('with extra properties', { foo: 'bar', baz: { a: 'z' } });
			logger.warn('yellow and orange');
			logger.error('with an error', { err });
			logger.fatal('i quit');

			done();
		});

		t.after((done) => {
			sinon.restore();
			done();
		});

		t.it('has the Levels enum', () => {
			const desc = Object.getOwnPropertyDescriptor(logger, 'Levels');
			assert.isOk(desc.enumerable);
			assert.isNotOk(desc.writable);
			assert.isNotOk(desc.configurable);

			assert.isNotEmpty(logger.Levels);
			assert.isOk(Object.isFrozen(logger.Levels));

			const keys = Object.keys(logger.Levels);
			assert.isEqual(6, keys.length);

			assert.isEqual(10, logger.Levels.TRACE);
			assert.isEqual(20, logger.Levels.DEBUG);
			assert.isEqual(30, logger.Levels.INFO);
			assert.isEqual(40, logger.Levels.WARN);
			assert.isEqual(50, logger.Levels.ERROR);
			assert.isEqual(60, logger.Levels.FATAL);
		});

		t.it('has default level TRACE', () => {
			assert.isEqual(Logger.Levels.TRACE, logger.level);
		});

		t.it('has default name', () => {
			assert.isEqual('root', logger.fields.name);
		});

		t.it('has default hostname', () => {
			assert.isEqual(hostname, logger.fields.hostname);
		});

		t.it('has default pid', () => {
			assert.isNonEmptyString(pid, 'process.pid is a string');
			assert.isEqual(pid, logger.fields.pid);
		});

		t.it('has default stream', () => {
			assert.isEqual(1, logger.streams.length);
			const [ thisStream ] = logger.streams;
			assert.isOk(thisStream instanceof streams.JSONStream);
			assert.isEqual(stream, thisStream);
		});

		t.it('writes to the stream for all log calls', () => {
			assert.isEqual(6, stream.write.callCount);
		});

		t.it('writes the level field for each log call', () => {
			const levels = stream.write.getCalls().map((call) => {
				return call.args[0].level;
			});

			assert.isEqual(6, levels.length);

			assert.isEqual(levels[0], Logger.Levels.TRACE);
			assert.isEqual(levels[1], Logger.Levels.DEBUG);
			assert.isEqual(levels[2], Logger.Levels.INFO);
			assert.isEqual(levels[3], Logger.Levels.WARN);
			assert.isEqual(levels[4], Logger.Levels.ERROR);
			assert.isEqual(levels[5], Logger.Levels.FATAL);
		});

		t.it('writes the name field for each log call', () => {
			const names = stream.write.getCalls().map((call) => {
				return call.args[0].name;
			});

			assert.isEqual(6, names.length);

			names.forEach((name) => {
				assert.isEqual('root', name);
			});
		});

		t.it('writes the hostname field for each log call', () => {
			const hostnames = stream.write.getCalls().map((call) => {
				return call.args[0].hostnames;
			});

			assert.isEqual(6, hostnames.length);

			hostnames.forEach((name) => {
				assert.isEqual(hostname, name);
			});
		});

		t.it('writes the pid field for each log call', () => {
			const pids = stream.write.getCalls().map((call) => {
				return call.args[0].pid;
			});

			assert.isEqual(6, pids.length);

			pids.forEach((thisPid) => {
				assert.isEqual(pid, thisPid);
			});
		});

		t.it('has default serializers', () => {
			assert.isEqual(1, Object.keys(logger.serializers).length);
			assert.isEqual('function', typeof logger.serializers.err);
		});

		t.it('setup default serializers', () => {
			assert.isEqual(1, Object.keys(serializers).length);
			Object.keys(serializers).forEach((key) => {
				assert.isEqual(1, serializers[key].callCount);
				const arg = serializers[key].getCall(0).args[0];
				assert.isNotEmpty(arg);
				assert.isEqual('object', typeof arg);
			});
		});

		t.it('uses the default serializers', () => {
			assert.isEqual(1, logger.serializers.err.callCount);
			assert.isOk(stream.serializers.err.calledWith(err));
			const call = stream.write.getCall(4);
			const [ record ] = call.args;
			assert.isEqual(err, record.err);
		});
	});
};
