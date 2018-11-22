'use strict';

const { assert } = require('kixx-assert');
const { Logger } = require('../../');

module.exports = (t) => {
	t.describe('Logger.create()', (t1) => {
		let subject;

		t1.before((done) => {
			subject = Logger.create();
			done();
		});

		t1.it('assigns default level=DEFAULT', () => {
			assert.isDefined(subject.level);
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

	t.describe('Logger#create()', (t1) => {
		let parent;
		let subject;

		const stream1 = {};
		const stream2 = {};

		const serializer1 = function () {};

		t1.before((done) => {
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

		t1.xit('emits record to parent stream');
	});
};
