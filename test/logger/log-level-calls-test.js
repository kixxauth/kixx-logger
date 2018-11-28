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
			[ Logger.TRACE, 10 ],
			[ Logger.DEBUG, 20 ],
			[ Logger.INFO, 30 ],
			[ Logger.WARN, 40 ],
			[ Logger.ERROR, 50 ],
			[ Logger.FATAL, 60 ]
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
				const [ levelS, levelN ] = LEVELS[index];
				return { rec, levelS, levelN };
			});

			tests.forEach(({ rec, levelS, levelN }) => {
				assert.isEqual('bozo', rec.name);
				assert.isNumberNotNaN(rec.level);
				assert.isEqual(levelN, rec.level);
				assert.isEqual(`${levelS} message`, rec.msg);
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

	t.describe('Logger#trace()', (t1) => {
		t1.describe('at TRACE level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.TRACE,
					stream
				});
				logger.trace('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(10, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at DEBUG level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.DEBUG,
					stream
				});
				logger.trace('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('does not emit a log record', () => {
				assert.isEqual(0, stream.write.callCount);
			});
		});

		t1.describe('at INFO level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.INFO,
					stream
				});
				logger.trace('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('does not emit a log record', () => {
				assert.isEqual(0, stream.write.callCount);
			});
		});

		t1.describe('at WARN level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.WARN,
					stream
				});
				logger.trace('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('does not emit a log record', () => {
				assert.isEqual(0, stream.write.callCount);
			});
		});

		t1.describe('at ERROR level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.ERROR,
					stream
				});
				logger.trace('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('does not emit a log record', () => {
				assert.isEqual(0, stream.write.callCount);
			});
		});

		t1.describe('at FATAL level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.FATAL,
					stream
				});
				logger.trace('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('does not emit a log record', () => {
				assert.isEqual(0, stream.write.callCount);
			});
		});
	});

	t.describe('Logger#debug()', (t1) => {
		t1.describe('at TRACE level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.TRACE,
					stream
				});
				logger.debug('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(20, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at DEBUG level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.DEBUG,
					stream
				});
				logger.debug('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(20, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at INFO level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.INFO,
					stream
				});
				logger.debug('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('does not emit a log record', () => {
				assert.isEqual(0, stream.write.callCount);
			});
		});

		t1.describe('at WARN level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.WARN,
					stream
				});
				logger.debug('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('does not emit a log record', () => {
				assert.isEqual(0, stream.write.callCount);
			});
		});

		t1.describe('at ERROR level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.ERROR,
					stream
				});
				logger.debug('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('does not emit a log record', () => {
				assert.isEqual(0, stream.write.callCount);
			});
		});

		t1.describe('at FATAL level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.FATAL,
					stream
				});
				logger.debug('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('does not emit a log record', () => {
				assert.isEqual(0, stream.write.callCount);
			});
		});
	});

	t.describe('Logger#info()', (t1) => {
		t1.describe('at TRACE level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.TRACE,
					stream
				});
				logger.info('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(30, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at DEBUG level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.DEBUG,
					stream
				});
				logger.info('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(30, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at INFO level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.INFO,
					stream
				});
				logger.info('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(30, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at WARN level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.WARN,
					stream
				});
				logger.info('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('does not emit a log record', () => {
				assert.isEqual(0, stream.write.callCount);
			});
		});

		t1.describe('at ERROR level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.ERROR,
					stream
				});
				logger.info('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('does not emit a log record', () => {
				assert.isEqual(0, stream.write.callCount);
			});
		});

		t1.describe('at FATAL level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.FATAL,
					stream
				});
				logger.info('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('does not emit a log record', () => {
				assert.isEqual(0, stream.write.callCount);
			});
		});
	});

	t.describe('Logger#warn()', (t1) => {
		t1.describe('at TRACE level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.TRACE,
					stream
				});
				logger.warn('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(40, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at DEBUG level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.DEBUG,
					stream
				});
				logger.warn('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(40, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at INFO level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.INFO,
					stream
				});
				logger.warn('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(40, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at WARN level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.WARN,
					stream
				});
				logger.warn('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(40, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at ERROR level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.ERROR,
					stream
				});
				logger.warn('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('does not emit a log record', () => {
				assert.isEqual(0, stream.write.callCount);
			});
		});

		t1.describe('at FATAL level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.FATAL,
					stream
				});
				logger.warn('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('does not emit a log record', () => {
				assert.isEqual(0, stream.write.callCount);
			});
		});
	});

	t.describe('Logger#error()', (t1) => {
		t1.describe('at TRACE level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.TRACE,
					stream
				});
				logger.error('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(50, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at DEBUG level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.DEBUG,
					stream
				});
				logger.error('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(50, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at INFO level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.INFO,
					stream
				});
				logger.error('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(50, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at WARN level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.WARN,
					stream
				});
				logger.error('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(50, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at ERROR level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.ERROR,
					stream
				});
				logger.error('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(50, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at FATAL level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.FATAL,
					stream
				});
				logger.error('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('does not emit a log record', () => {
				assert.isEqual(0, stream.write.callCount);
			});
		});
	});

	t.describe('Logger#fatal()', (t1) => {
		t1.describe('at TRACE level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.TRACE,
					stream
				});
				logger.fatal('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(60, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at DEBUG level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.DEBUG,
					stream
				});
				logger.fatal('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(60, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at INFO level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.INFO,
					stream
				});
				logger.fatal('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(60, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at WARN level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.WARN,
					stream
				});
				logger.fatal('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(60, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at ERROR level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.ERROR,
					stream
				});
				logger.fatal('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(60, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('at FATAL level', (t2) => {
			const sandbox = Sinon.createSandbox();

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				const logger = Logger.create({
					level: Logger.FATAL,
					stream
				});
				logger.fatal('message', { foo: 'bar' });
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('emits a log record', () => {
				assert.isEqual(1, stream.write.callCount);
				const [ rec ] = stream.write.firstCall.args;
				assert.isEqual(60, rec.level);
				assert.isEqual(new Date().getHours(), rec.time.getHours());
				assert.isEqual('message', rec.msg);
				assert.isEqual('bar', rec.foo);
			});
		});
	});
};
