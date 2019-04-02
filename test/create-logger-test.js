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

	function identity(x) {
		return x;
	}


	t.describe('with defaults', (t1) => {
		let logger;
		let stream;
		const err = {};

		t1.before((done) => {
			logger = createLogger();

			assert.isEqual(logger.streams.length, 1);

			stream = logger.streams[0];

			sinon.stub(stream, '_transform').callsFake(noop);

			Object.keys(stream.serializers).forEach((key) => {
				sinon.stub(stream.serializers, key).callsFake(identity);
			});

			logger.trace('trace level message');
			logger.debug('default fields');
			logger.info('with extra properties', { foo: 'bar', baz: { a: 'z' } });
			logger.warn('yellow and orange');
			logger.error('with an error', { err });
			logger.fatal('i quit');

			done();
		});

		t1.after((done) => {
			sinon.restore();
			done();
		});

		t1.it('has default level', () => {
			assert.isEqual(Logger.Levels.TRACE, logger.level);

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
			assert.isOk(thisStream instanceof streams.JSONStream);
			assert.isEqual(stream, thisStream);
		});

		t1.it('has default serializers', () => {
			assert.isEqual(1, Object.keys(stream.serializers).length);
			assert.isEqual(6, stream._transform.callCount);
			const call = stream._transform.getCall(4);
			const [ record ] = call.args;
			assert.isEqual(err, record.err);
			assert.isEqual(1, stream.serializers.err.callCount);
			assert.isOk(stream.serializers.err.calledWith(err));
		});
	});

	t.describe('with options.name', (t1) => {
		let logger;
		let stream;

		t1.before((done) => {
			logger = createLogger({
				name: 'My Logger'
			});

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

		t1.after((done) => {
			sinon.restore();
			done();
		});

		t1.it('has default level', () => {
			assert.isEqual(Logger.Levels.TRACE, logger.level);
		});

		t1.it('has given name', () => {
			assert.isEqual('My Logger', logger.fields.name);

			assert.isEqual(6, stream._transform.callCount);

			const names = stream._transform.getCalls().map((call) => {
				return call.args[0].name;
			});

			names.forEach((name) => {
				assert.isEqual('My Logger', name);
			});
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
			const [ thisStream ] = logger.streams;
			assert.isOk(thisStream instanceof streams.JSONStream);
			assert.isEqual(stream, thisStream);
		});

		t1.it('has default serializers', () => {
			assert.isEqual(1, Object.keys(stream.serializers).length);
			assert.isEqual('function', typeof stream.serializers.err);
		});
	});

	t.describe('with options.level', (t1) => {
		let logger;
		let stream;

		t1.before((done) => {
			logger = createLogger({
				level: Logger.Levels.INFO
			});

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

		t1.after((done) => {
			sinon.restore();
			done();
		});

		t1.it('has given level', () => {
			assert.isEqual(Logger.Levels.INFO, logger.level);

			assert.isEqual(4, stream._transform.callCount);

			const levels = stream._transform.getCalls().map((call) => {
				return call.args[0].level;
			});

			assert.isEqual(levels[0], Logger.Levels.INFO);
			assert.isEqual(levels[1], Logger.Levels.WARN);
			assert.isEqual(levels[2], Logger.Levels.ERROR);
			assert.isEqual(levels[3], Logger.Levels.FATAL);
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
			const [ thisStream ] = logger.streams;
			assert.isOk(thisStream instanceof streams.JSONStream);
			assert.isEqual(stream, thisStream);
		});

		t1.it('has default serializers', () => {
			assert.isEqual(1, Object.keys(stream.serializers).length);
			assert.isEqual('function', typeof stream.serializers.err);
			assert.isEqual(serializers.err, stream.serializers.err);
		});
	});

	t.describe('with options.stream', (t1) => {
		let logger;
		let stream;

		t1.before((done) => {
			stream = {
				write: sinon.spy()
			};

			logger = createLogger({
				streams: [ stream ]
			});

			assert.isEqual(logger.streams.length, 1);

			logger.trace('trace level message');
			logger.debug('default fields');
			logger.info('with extra properties', { foo: 'bar', baz: { a: 'z' } });
			logger.warn('yellow and orange');
			logger.error('with an error', { err: new Error('test serializer') });
			logger.fatal('i quit');

			done();
		});

		t1.after((done) => {
			sinon.restore();
			done();
		});

		t1.it('has default level', () => {
			assert.isEqual(Logger.Levels.TRACE, logger.level);
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
			const [ thisStream ] = logger.streams;
			assert.isEqual(stream, thisStream);
			assert.isEqual(6, stream.write.callCount);
		});

		t1.it('has default serializers', () => {
			assert.isEqual(1, Object.keys(stream.serializers).length);
			assert.isEqual('function', typeof stream.serializers.err);
		});
	});

	t.describe('with options.serializers', (t1) => {
		let logger;
		let stream;
		const foo = 'bar';
		const baz = { a: 'z' };
		const err = {};

		t1.before((done) => {
			logger = createLogger({
				serializers: {
					foo() {
						return sinon.spy(identity);
					},
					baz() {
						return sinon.spy(identity);
					},
					err() {
						return sinon.spy(identity);
					}
				}
			});

			assert.isEqual(logger.streams.length, 1);

			stream = logger.streams[0];

			sinon.stub(stream, '_transform').callsFake(noop);

			Object.keys(stream.serializers).forEach((key) => {
				sinon.stub(stream.serializers, key).callsFake(identity);
			});

			logger.trace('trace level message');
			logger.debug('default fields');
			logger.info('with extra properties', { foo, baz });
			logger.warn('yellow and orange');
			logger.error('with an error', { err });
			logger.fatal('i quit');

			done();
		});

		t1.after((done) => {
			sinon.restore();
			done();
		});

		t1.it('has default level', () => {
			assert.isEqual(Logger.Levels.TRACE, logger.level);
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
			const [ thisStream ] = logger.streams;
			assert.isOk(thisStream instanceof streams.JSONStream);
			assert.isEqual(stream, thisStream);
		});

		t1.it('has given serializers', () => {
			assert.isEqual(3, Object.keys(stream.serializers).length);
			assert.isEqual('function', typeof stream.serializers.foo);
			assert.isEqual('function', typeof stream.serializers.baz);
			assert.isEqual('function', typeof stream.serializers.err);
			assert.isEqual(1, stream.serializers.foo.callCount);
			assert.isEqual(1, stream.serializers.baz.callCount);
			assert.isEqual(1, stream.serializers.err.callCount);
			assert.isOk(stream.serializers.foo.calledWith(foo));
			assert.isOk(stream.serializers.baz.calledWith(baz));
			assert.isOk(stream.serializers.err.calledWith(err));
		});
	});

	t.describe('with options.fields', (t1) => {
		let logger;
		let stream;
		const hostname = 'foo.bar.baz';
		const foo = 'bar';
		const baz = { a: 'b' };

		t1.before((done) => {
			logger = createLogger({
				fields: {
					name: 'Foo Bar Baz',
					hostname,
					foo,
					baz
				}
			});

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

		t1.after((done) => {
			sinon.restore();
			done();
		});

		t1.it('has default level', () => {
			assert.isEqual(Logger.Levels.TRACE, logger.level);
		});

		t1.it('has default name', () => {
			assert.isEqual('root', logger.fields.name);
		});

		t1.it('has given hostname', () => {
			assert.isNonEmptyString(logger.fields.hostname);
			assert.isEqual(hostname, logger.fields.hostname);

			const hostnames = stream._transform.getCalls().map((call) => {
				return call.args[0].hostname;
			});

			assert.isEqual(6, hostnames.length);

			hostnames.forEach((name) => {
				assert.isEqual(hostname, name);
			});
		});

		t1.it('has given fields', () => {
			assert.isEqual(foo, logger.fields.foo);
			assert.isEqual(baz, logger.fields.baz);

			const foos = stream._transform.getCalls().map((call) => {
				return call.args[0].foo;
			});

			const bazes = stream._transform.getCalls().map((call) => {
				return call.args[0].baz;
			});

			assert.isEqual(6, foos.length);
			assert.isEqual(6, bazes.length);

			foos.forEach((x) => {
				assert.isEqual(foo, x);
			});

			bazes.forEach((x) => {
				assert.isEqual(baz, x);
			});
		});

		t1.it('has default pid', () => {
			assert.isDefined(logger.fields.pid);
			assert.isEqual(process.pid, logger.fields.pid);
		});

		t1.it('has default stream', () => {
			assert.isEqual(1, logger.streams.length);
			const [ thisStream ] = logger.streams;
			assert.isOk(thisStream instanceof streams.JSONStream);
			assert.isEqual(stream, thisStream);
		});

		t1.it('has default serializers', () => {
			assert.isEqual(1, Object.keys(stream.serializers).length);
			assert.isEqual('function', typeof stream.serializers.err);
			assert.isEqual(serializers.err, stream.serializers.err);
		});
	});

	t.describe('with options.pretty', (t1) => {
		let logger;
		let stream;

		t1.before((done) => {
			logger = createLogger({
				pretty: true
			});

			assert.isEqual(logger.streams.length, 1);

			stream = logger.streams[0];

			logger.trace('trace level message');
			logger.debug('default fields');
			logger.info('with extra properties', { foo: 'bar', baz: { a: 'z' } });
			logger.warn('yellow and orange');
			logger.error('with an error', { err: new Error('test serializer') });
			logger.fatal('i quit');

			done();
		});

		t1.after((done) => {
			sinon.restore();
			done();
		});

		t1.it('has default level', () => {
			assert.isEqual(Logger.Levels.TRACE, logger.level);
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

		t1.it('has pretty stream', () => {
			assert.isEqual(1, logger.streams.length);
			const [ thisStream ] = logger.streams;
			assert.isOk(thisStream instanceof streams.PrettyStream);
			assert.isEqual(stream, thisStream);
		});

		t1.it('has default serializers', () => {
			assert.isEqual(1, Object.keys(stream.serializers).length);
			assert.isEqual('function', typeof stream.serializers.err);
		});
	});
};
