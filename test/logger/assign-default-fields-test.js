'use strict';

const { assert } = require('kixx-assert');
const Sinon = require('sinon');
const { Logger } = require('../../');

module.exports = (t) => {
	t.describe('Logger#assignDefaultFields()', (t1) => {
		t1.describe('with additional fields', (t2) => {
			const sandbox = Sinon.createSandbox();

			let subject;

			const stream = {
				write() {}
			};

			const defaultFields = {
				foo: 'bar'
			};

			const additionalFields = {
				bar: 'foo'
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');

				subject = Logger.create({
					stream,
					defaultFields
				});

				subject.assignDefaultFields(additionalFields);

				subject.debug('debug message');

				// Test with an override.
				subject.info('info message', { bar: 'baz' });

				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('should emit default fields', () => {
				const rec1 = stream.write.firstCall.args[0];
				const rec2 = stream.write.secondCall.args[0];

				assert.isEqual(20, rec1.level);
				assert.isEqual('bar', rec1.foo);
				assert.isEqual('foo', rec1.bar);

				assert.isEqual(30, rec2.level);
				assert.isEqual('bar', rec2.foo);
				assert.isEqual('baz', rec2.bar);
			});
		});

		t1.describe('with children', (t2) => {
			const sandbox = Sinon.createSandbox();

			let subject;

			const stream = {
				write() {}
			};

			const defaultFields = {
				foo: 'bar'
			};

			const additionalFields = {
				bar: 'foo'
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');

				const parent = Logger.create({
					stream,
					defaultFields
				});

				subject = parent.create('My Logger');

				parent.assignDefaultFields(additionalFields);

				subject.debug('debug message');

				// Test with an override.
				subject.info('info message', { bar: 'baz' });

				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('should emit default fields', () => {
				const rec1 = stream.write.firstCall.args[0];
				const rec2 = stream.write.secondCall.args[0];

				assert.isEqual(20, rec1.level);
				assert.isEqual('bar', rec1.foo);
				assert.isEqual('foo', rec1.bar);

				assert.isEqual(30, rec2.level);
				assert.isEqual('bar', rec2.foo);
				assert.isEqual('baz', rec2.bar);
			});
		});

		t1.describe('with nested children', (t2) => {
			const sandbox = Sinon.createSandbox();

			let subject;

			const stream = {
				write() {}
			};

			const defaultFields = {
				foo: 'bar'
			};

			const additionalFields = {
				bar: 'foo'
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');

				const grandParent = Logger.create({
					stream,
					defaultFields
				});

				const parent = grandParent.create('Parent Logger');

				subject = parent.create('Child Logger');

				grandParent.assignDefaultFields(additionalFields);

				subject.debug('debug message');

				// Test with an override.
				subject.info('info message', { bar: 'baz' });

				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('should emit default fields', () => {
				const rec1 = stream.write.firstCall.args[0];
				const rec2 = stream.write.secondCall.args[0];

				assert.isEqual(20, rec1.level);
				assert.isEqual('bar', rec1.foo);
				assert.isEqual('foo', rec1.bar);

				assert.isEqual(30, rec2.level);
				assert.isEqual('bar', rec2.foo);
				assert.isEqual('baz', rec2.bar);
			});
		});
	});
};
