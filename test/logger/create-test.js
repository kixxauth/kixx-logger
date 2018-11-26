'use strict';

const { assert } = require('kixx-assert');
const os = require('os');
const Sinon = require('sinon');
const { Logger } = require('../../');

module.exports = (t) => {
	t.describe('Logger.create() with defaults', (t1) => {
		const subject = Logger.create();

		t1.it('assigns default level=DEFAULT', () => {
			assert.isNonEmptyString(subject.level);
			assert.isEqual(Logger.DEBUG, subject.level);
		});

		t1.it('assigns only default fields', () => {
			const { fields } = subject;
			const keys = Object.keys(fields);
			assert.isEqual(3, keys.length);
			assert.isOk(keys.includes('name'), 'fields.name');
			assert.isOk(keys.includes('hostname'), 'fields.hostname');
			assert.isOk(keys.includes('pid'), 'fields.pid');
		});

		t1.it('assigns a default name', () => {
			const { fields } = subject;
			assert.isEqual('root', fields.name);
		});

		t1.it('assigns fields.hostname', () => {
			const { fields } = subject;
			assert.isNonEmptyString(fields.hostname, 'fields.hostname');
			assert.isEqual(os.hostname(), fields.hostname);
		});

		t1.it('assigns fields.pid', () => {
			const { fields } = subject;
			assert.isDefined(fields.pid, 'fields.pid');
			assert.isEqual(process.pid, fields.pid);
		});

		t1.it('does not have a default stream', () => {
			assert.isEqual(0, subject.streams.length);
		});

		t1.it('does not have default serializers', () => {
			const serializers = Object.keys(subject.serializers);
			assert.isEqual(0, serializers.length);
		});
	});

	t.describe('Logger.create() with options.name', (t1) => {
		const subject = Logger.create({
			name: 'My Logger'
		});

		t1.it('assigns default level=DEFAULT', () => {
			assert.isNonEmptyString(subject.level);
			assert.isEqual(Logger.DEBUG, subject.level);
		});

		t1.it('assigns only default fields', () => {
			const { fields } = subject;
			const keys = Object.keys(fields);
			assert.isEqual(3, keys.length);
			assert.isOk(keys.includes('name'), 'fields.name');
			assert.isOk(keys.includes('hostname'), 'fields.hostname');
			assert.isOk(keys.includes('pid'), 'fields.pid');
		});

		t1.it('assigns a name', () => {
			const { fields } = subject;
			assert.isEqual('My Logger', fields.name);
		});

		t1.it('assigns fields.hostname', () => {
			const { fields } = subject;
			assert.isNonEmptyString(fields.hostname, 'fields.hostname');
			assert.isEqual(os.hostname(), fields.hostname);
		});

		t1.it('assigns fields.pid', () => {
			const { fields } = subject;
			assert.isNumberNotNaN(fields.pid, 'fields.pid');
		});

		t1.it('does not have a default stream', () => {
			assert.isEqual(0, subject.streams.length);
		});

		t1.it('does not have default serializers', () => {
			const serializers = Object.keys(subject.serializers);
			assert.isEqual(0, serializers.length);
		});
	});

	t.describe('Logger.create() with options.level', (t1) => {
		const subject = Logger.create({
			level: Logger.FATAL
		});

		t1.it('assigns the given level', () => {
			assert.isNonEmptyString(subject.level);
			assert.isEqual(Logger.FATAL, subject.level);
		});

		t1.it('assigns only default fields', () => {
			const { fields } = subject;
			const keys = Object.keys(fields);
			assert.isEqual(3, keys.length);
			assert.isOk(keys.includes('name'), 'fields.name');
			assert.isOk(keys.includes('hostname'), 'fields.hostname');
			assert.isOk(keys.includes('pid'), 'fields.pid');
		});

		t1.it('assigns a default name', () => {
			const { fields } = subject;
			assert.isEqual('root', fields.name);
		});

		t1.it('assigns fields.hostname', () => {
			const { fields } = subject;
			assert.isNonEmptyString(fields.hostname, 'fields.hostname');
			assert.isEqual(os.hostname(), fields.hostname);
		});

		t1.it('assigns fields.pid', () => {
			const { fields } = subject;
			assert.isDefined(fields.pid, 'fields.pid');
			assert.isEqual(process.pid, fields.pid);
		});

		t1.it('does not have a default stream', () => {
			assert.isEqual(0, subject.streams.length);
		});

		t1.it('does not have default serializers', () => {
			const serializers = Object.keys(subject.serializers);
			assert.isEqual(0, serializers.length);
		});
	});

	t.describe('Logger.create() with options.defaultFields', (t1) => {
		const subject = Logger.create({
			defaultFields: {
				foo: 'bar'
			}
		});

		t1.it('assigns default level=DEFAULT', () => {
			assert.isNonEmptyString(subject.level);
			assert.isEqual(Logger.DEBUG, subject.level);
		});

		t1.it('assigns additional fields', () => {
			const { fields } = subject;
			const keys = Object.keys(fields);
			assert.isEqual(4, keys.length);
			assert.isOk(keys.includes('name'), 'fields.name');
			assert.isOk(keys.includes('hostname'), 'fields.hostname');
			assert.isOk(keys.includes('pid'), 'fields.pid');
			assert.isEqual('bar', fields.foo);
		});

		t1.it('assigns a default name', () => {
			const { fields } = subject;
			assert.isEqual('root', fields.name);
		});

		t1.it('assigns fields.hostname', () => {
			const { fields } = subject;
			assert.isNonEmptyString(fields.hostname, 'fields.hostname');
			assert.isEqual(os.hostname(), fields.hostname);
		});

		t1.it('assigns fields.pid', () => {
			const { fields } = subject;
			assert.isDefined(fields.pid, 'fields.pid');
			assert.isEqual(process.pid, fields.pid);
		});

		t1.it('does not have a default stream', () => {
			assert.isEqual(0, subject.streams.length);
		});

		t1.it('does not have default serializers', () => {
			const serializers = Object.keys(subject.serializers);
			assert.isEqual(0, serializers.length);
		});
	});

	t.describe('Logger#create()', (t1) => {
		const sandbox = Sinon.createSandbox();

		let parent;
		let subject;

		const stream1 = {
			write() {}
		};

		const stream2 = {
			write() {}
		};

		const serializer1 = function () {};

		t1.before((done) => {
			sandbox.stub(stream1, 'write');
			sandbox.stub(stream2, 'write');

			parent = Logger.create({
				level: Logger.FATAL,
				defaultFields: {
					myField: 'my field'
				},
				stream: stream1,
				serializers: {
					myProp: serializer1
				}
			});

			parent.addStream(stream2);

			subject = parent.create('My Logger');

			done();
		});

		t1.after((done) => {
			sandbox.restore();
			done();
		});

		t1.it('assigns the given name', () => {
			const { fields } = subject;
			assert.isEqual('My Logger', fields.name);
		});

		t1.it('assigns the parent level', () => {
			assert.isEqual(Logger.FATAL, subject.level);
		});

		t1.it('assigns parent fields', () => {
			const { fields } = subject;
			assert.isNonEmptyString(fields.hostname, 'fields.hostname');
			assert.isNumberNotNaN(fields.pid, 'fields.pid');
			assert.isEqual('my field', fields.myField);
		});

		t1.it('assigns parent streams', () => {
			const { streams } = subject;
			assert.isEqual(stream1, streams[0]);
			assert.isEqual(stream2, streams[1]);
		});

		t1.it('assigns parent serializers', () => {
			const { serializers } = subject;
			assert.isEqual(serializer1, serializers.myProp);
		});

		t1.it('emits record to parent streams', () => {
			subject.info('info message');
			subject.fatal('fatal message');

			assert.isOk(stream1.write.calledOnce, 'stream1.write() calledOnce');
			assert.isOk(stream2.write.calledOnce, 'stream2.write() calledOnce');

			assert.isEqual(1, stream1.write.firstCall.args.length);
			assert.isEqual(1, stream2.write.firstCall.args.length);

			const rec1 = stream1.write.firstCall.args[0];
			const rec2 = stream2.write.firstCall.args[0];

			assert.isEqual('My Logger', rec1.name);
			assert.isEqual('fatal message', rec1.msg);

			assert.isEqual('My Logger', rec2.name);
			assert.isEqual('fatal message', rec2.msg);
		});
	});

	t.describe('Logger#create() nested child', (t1) => {
		const sandbox = Sinon.createSandbox();

		let subject;

		const stream1 = {
			write() {}
		};

		const stream2 = {
			write() {}
		};

		const serializer1 = function () {};

		t1.before((done) => {
			sandbox.stub(stream1, 'write');
			sandbox.stub(stream2, 'write');

			const grandParent = Logger.create({
				level: Logger.FATAL,
				defaultFields: {
					myField: 'my field'
				},
				stream: stream1,
				serializers: {
					myProp: serializer1
				}
			});

			const parent = grandParent.create('Parent Logger');

			parent.addStream(stream2);

			subject = parent.create('Child Logger');

			done();
		});

		t1.after((done) => {
			sandbox.restore();
			done();
		});

		t1.it('assigns the given name', () => {
			const { fields } = subject;
			assert.isEqual('Child Logger', fields.name);
		});

		t1.it('assigns the parent level', () => {
			assert.isEqual(Logger.FATAL, subject.level);
		});

		t1.it('assigns parent fields', () => {
			const { fields } = subject;
			assert.isNonEmptyString(fields.hostname, 'fields.hostname');
			assert.isNumberNotNaN(fields.pid, 'fields.pid');
			assert.isEqual('my field', fields.myField);
		});

		t1.it('assigns parent streams', () => {
			const { streams } = subject;
			assert.isEqual(stream1, streams[0]);
			assert.isEqual(stream2, streams[1]);
		});

		t1.it('assigns parent serializers', () => {
			const { serializers } = subject;
			assert.isEqual(serializer1, serializers.myProp);
		});

		t1.it('emits record to parent streams', () => {
			subject.info('info message');
			subject.fatal('fatal message');

			assert.isOk(stream1.write.calledOnce, 'stream1.write() calledOnce');
			assert.isOk(stream2.write.calledOnce, 'stream2.write() calledOnce');

			assert.isEqual(1, stream1.write.firstCall.args.length);
			assert.isEqual(1, stream2.write.firstCall.args.length);

			const rec1 = stream1.write.firstCall.args[0];
			const rec2 = stream2.write.firstCall.args[0];

			assert.isEqual('Child Logger', rec1.name);
			assert.isEqual('fatal message', rec1.msg);

			assert.isEqual('Child Logger', rec2.name);
			assert.isEqual('fatal message', rec2.msg);
		});
	});
};
