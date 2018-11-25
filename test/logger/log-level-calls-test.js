'use strict';

const { assert } = require('kixx-assert');
const Sinon = require('sinon');
const { Logger } = require('../../');

module.exports = (t) => {
	t.describe('emitted log record', (t1) => {
		const sandbox = Sinon.createSandbox();

		const stream = {
			write() {}
		};

		const defaultFields = {
			msg: 'default message',
			hostname: 'My Hostname',
			foo: 'foo'
		};

		const serializers = {
			baz() {
				return 'BAZ';
			},
			foo(x) {
				return x.toUpperCase();
			},
			time(x) {
				return x.getFullYear();
			}
		};

		const LEVELS = [
			Logger.TRACE,
			Logger.DEBUG,
			Logger.INFO,
			Logger.WARN,
			Logger.ERROR,
			Logger.FATAL
		];

		t1.before((done) => {
			sandbox.stub(stream, 'write');

			const logger = Logger.create({
				level: Logger.TRACE,
				defaultFields,
				serializers,
				stream
			});

			logger.trace('trace message', { foo: 'bar', name: 'bozo' });
			logger.debug('debug message', { foo: 'bar', name: 'bozo' });
			logger.info('info message', { foo: 'bar', name: 'bozo' });
			logger.warn('warn message', { foo: 'bar', name: 'bozo' });
			logger.error('error message', { foo: 'bar', name: 'bozo' });
			logger.fatal('fatal message', { foo: 'bar', name: 'bozo' });

			done();
		});

		t1.after((done) => {
			sandbox.restore();
			done();
		});

		t1.it('has expected fields', () => {
			const calls = stream.write.getCalls();

			assert.isEqual(6, calls.length);

			const tests = calls.map((call, index) => {
				const [ rec ] = call.args;
				const level = LEVELS[index];
				return { rec, level };
			});

			tests.forEach(({ rec, level }) => {
				assert.isEqual('bozo', rec.name);
				assert.isNonEmptyString(rec.level);
				assert.isEqual(level, rec.level);
				assert.isEqual(`${level} message`, rec.msg);
				assert.isEqual('My Hostname', rec.hostname);
				assert.isEqual(new Date().getFullYear(), rec.time);
				assert.isEqual('BAR', rec.foo);
				assert.isUndefined(rec.baz);
			});
		});
	});

	t.describe('with different stream levels', (t1) => {
		const sandbox = Sinon.createSandbox();

		const traceStream = {
			level: Logger.TRACE,
			write() {}
		};
		const debugStream = {
			level: Logger.DEBUG,
			write() {}
		};
		const infoStream = {
			level: Logger.INFO,
			write() {}
		};
		const warnStream = {
			level: Logger.WARN,
			write() {}
		};
		const errorStream = {
			level: Logger.ERROR,
			write() {}
		};
		const fatalStream = {
			level: Logger.FATAL,
			write() {}
		};

		t1.before((done) => {
			sandbox.stub(traceStream, 'write');
			sandbox.stub(debugStream, 'write');
			sandbox.stub(infoStream, 'write');
			sandbox.stub(warnStream, 'write');
			sandbox.stub(errorStream, 'write');
			sandbox.stub(fatalStream, 'write');

			const logger = Logger.create({
				level: Logger.TRACE
			});

			logger.addStream(traceStream);
			logger.addStream(debugStream);
			logger.addStream(infoStream);
			logger.addStream(warnStream);
			logger.addStream(errorStream);
			logger.addStream(fatalStream);

			logger.trace('trace message');
			logger.debug('debug message');
			logger.info('info message');
			logger.warn('warn message');
			logger.error('error message');
			logger.fatal('fatal message');

			done();
		});

		t1.after((done) => {
			sandbox.restore();
			done();
		});

		t1.it('calls expected streams', () => {
			assert.isEqual(6, traceStream.write.callCount);
			assert.isEqual(5, debugStream.write.callCount);
			assert.isEqual(4, infoStream.write.callCount);
			assert.isEqual(3, warnStream.write.callCount);
			assert.isEqual(2, errorStream.write.callCount);
			assert.isEqual(1, fatalStream.write.callCount);
		});
	});

	t.xdescribe('Logger#trace()', (t1) => {
	});
};
