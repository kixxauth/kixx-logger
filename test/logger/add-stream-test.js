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

				assert.isEqual(10, call1.args[0].level);
				assert.isEqual(20, call2.args[0].level);
				assert.isEqual(30, call3.args[0].level);
				assert.isEqual(40, call4.args[0].level);
				assert.isEqual(50, call5.args[0].level);
				assert.isEqual(60, call6.args[0].level);
			});
		});

		t1.describe('with init() function', (t2) => {
			const sandbox = Sinon.createSandbox();

			let subject;

			const stream = {
				init() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'init');

				subject = Logger.create();

				subject.addStream(stream);

				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('calls the init function', () => {
				assert.isEqual(1, stream.init.callCount);
				assert.isEqual(0, stream.init.firstCall.args.length);
			});
		});

		t1.describe('with explicit level', (t2) => {
			const sandbox = Sinon.createSandbox();

			let subject;

			const stream = {
				level: Logger.ERROR,
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

			t2.it('calls set log level', () => {
				assert.isEqual(2, stream.write.callCount);

				const call1 = stream.write.getCall(0);
				const call2 = stream.write.getCall(1);

				assert.isEqual(50, call1.args[0].level);
				assert.isEqual(60, call2.args[0].level);
			});
		});

		t1.describe('with children', (t2) => {
			const sandbox = Sinon.createSandbox();

			let subject;

			const stream = {
				level: Logger.ERROR,
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');

				const parent = Logger.create({
					level: Logger.TRACE
				});

				subject = parent.create('My Logger');

				parent.addStream(stream);

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

			t2.it('calls set log level', () => {
				assert.isEqual(2, stream.write.callCount);

				const call1 = stream.write.getCall(0);
				const call2 = stream.write.getCall(1);

				assert.isEqual(50, call1.args[0].level);
				assert.isEqual(60, call2.args[0].level);
			});
		});

		t1.describe('with nested children', (t2) => {
			const sandbox = Sinon.createSandbox();

			let subject;

			const stream = {
				level: Logger.ERROR,
				init() {},
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'init');
				sandbox.stub(stream, 'write');

				const grandParent = Logger.create({
					level: Logger.TRACE
				});

				const parent = grandParent.create('Parent Logger');

				subject = parent.create('Child Logger');

				grandParent.addStream(stream);

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

			t2.it('only calls init() once', () => {
				assert.isEqual(1, stream.init.callCount);
			});

			t2.it('calls set log level', () => {
				assert.isEqual(2, stream.write.callCount);

				const call1 = stream.write.getCall(0);
				const call2 = stream.write.getCall(1);

				assert.isEqual(50, call1.args[0].level);
				assert.isEqual(60, call2.args[0].level);
			});
		});

		t1.describe('with already attached stream', (t2) => {
			const sandbox = Sinon.createSandbox();

			let subject;

			const stream = {
				init() {},
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'init');
				sandbox.stub(stream, 'write');

				subject = Logger.create({
					level: Logger.TRACE,
					stream
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

			t2.it('only calls init() once', () => {
				assert.isEqual(1, stream.init.callCount);
			});

			t2.it('calls every log level once', () => {
				assert.isEqual(6, stream.write.callCount);

				const call1 = stream.write.getCall(0);
				const call2 = stream.write.getCall(1);
				const call3 = stream.write.getCall(2);
				const call4 = stream.write.getCall(3);
				const call5 = stream.write.getCall(4);
				const call6 = stream.write.getCall(5);

				assert.isEqual(10, call1.args[0].level);
				assert.isEqual(20, call2.args[0].level);
				assert.isEqual(30, call3.args[0].level);
				assert.isEqual(40, call4.args[0].level);
				assert.isEqual(50, call5.args[0].level);
				assert.isEqual(60, call6.args[0].level);
			});
		});
	});
};
