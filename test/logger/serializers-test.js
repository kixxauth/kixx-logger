'use strict';

module.exports = (t) => {
	t.describe('Logger with serializers', (t1) => {
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
};
