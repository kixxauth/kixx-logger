'use strict';

const { assert } = require('kixx-assert');
const Sinon = require('sinon');
const { Logger } = require('../../');

module.exports = (t) => {
	t.describe('Logger#addStream()', (t1) => {
		t1.describe('with default level', (t2) => {
			const sandbox = Sinon.createSandbox();

			let subject;

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');

				subject = Logger.create({
					level: Logger.TRACE
				});

				subject.addStream(stream);

				subject.trace('trace message');
				subject.debug('debug message');
				subject.info('info message');
				subject.warn('warn message');
				subject.error('error message');
				subject.fatal('fatal message');

				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('calls every log level', () => {
				assert.isEqual(6, stream.write.callCount);

				const call1 = stream.write.getCall(0);
				const call2 = stream.write.getCall(1);
				const call3 = stream.write.getCall(2);
				const call4 = stream.write.getCall(3);
				const call5 = stream.write.getCall(4);
				const call6 = stream.write.getCall(5);

				assert.isEqual(Logger.TRACE, call1.args[0].level);
				assert.isEqual(Logger.DEBUG, call2.args[0].level);
				assert.isEqual(Logger.INFO, call3.args[0].level);
				assert.isEqual(Logger.WARN, call4.args[0].level);
				assert.isEqual(Logger.ERROR, call5.args[0].level);
				assert.isEqual(Logger.FATAL, call6.args[0].level);
			});
		});

		t1.xdescribe('with init() function', (t2) => {
		});

		t1.xdescribe('with explicit level', (t2) => {
		});

		t1.xdescribe('with children', (t2) => {
		});
	});
};
