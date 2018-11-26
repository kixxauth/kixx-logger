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

	t.describe('Logger.create() with options.stream', (t1) => {
		const sandbox = Sinon.createSandbox();

		const stream = {
			write() {},
			init() {}
		};

		let subject;

		t1.before((done) => {
			sandbox.stub(stream, 'init');

			subject = Logger.create({
				stream
			});

			done();
		});

		t1.after((done) => {
			sandbox.restore();
			done();
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

		t1.it('does attaches a stream', () => {
			assert.isEqual(1, subject.streams.length);
			assert.isEqual(stream, subject.streams[0]);
		});

		t1.it('calls init() on the stream', () => {
			assert.isOk(stream.init.calledOnce, 'stream.init() calledOnce');
		});

		t1.it('does not have default serializers', () => {
			const serializers = Object.keys(subject.serializers);
			assert.isEqual(0, serializers.length);
		});
	});

	t.describe('Logger.create() with options.serializers', (t1) => {
		const serializers = {
			foo() {
				return 'bar';
			}
		};

		const subject = Logger.create({ serializers });

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

		t1.it('assigns the given serializers', () => {
			assert.isEqual(1, Object.keys(subject.serializers).length);
			assert.isEqual(serializers.foo, subject.serializers.foo);
		});
	});
};
