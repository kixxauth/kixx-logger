'use strict';

const { assert } = require('kixx-assert');
const Sinon = require('sinon');
const { Logger } = require('../../');

module.exports = (t) => {
	t.describe('Logger#assignSerializers()', (t1) => {
		t1.describe('with new serializers', (t2) => {
			const sandbox = Sinon.createSandbox();

			let subject;

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');

				subject = Logger.create({
					stream,
					defaultSerializers: {
						foo() {
							return 'foo';
						}
					}
				});

				subject.assignSerializers({
					foo() {
						return 'bar';
					},
					bar() {
						return 'bar';
					}
				});

				subject.debug('debug message', { foo: 1, bar: 1 });

				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('intercepts expected properties', () => {
				const rec = stream.write.firstCall.args[0];
				assert.isEqual('bar', rec.bar);
			});

			t2.it('overrides default serializers', () => {
				const rec = stream.write.firstCall.args[0];
				assert.isEqual('bar', rec.foo);
			});
		});

		t1.describe('with children', (t2) => {
			const sandbox = Sinon.createSandbox();

			let subject;

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');

				const parent = Logger.create({
					stream,
					defaultSerializers: {
						foo() {
							return 'foo';
						}
					}
				});

				subject = parent.create('My Logger');

				parent.assignSerializers({
					foo() {
						return 'bar';
					},
					bar() {
						return 'bar';
					}
				});

				subject.debug('debug message', { foo: 1, bar: 1 });

				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('intercepts expected properties', () => {
				const rec = stream.write.firstCall.args[0];
				assert.isEqual('bar', rec.bar);
			});

			t2.it('overrides default serializers', () => {
				const rec = stream.write.firstCall.args[0];
				assert.isEqual('bar', rec.foo);
			});
		});
	});
};
