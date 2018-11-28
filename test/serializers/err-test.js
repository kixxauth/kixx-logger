'use strict';

const { assert } = require('kixx-assert');
const { serializers } = require('../../');

module.exports = (t) => {
	t.describe('err() serializer with defaults', (t1) => {
		let subject;

		t1.before((done) => {
			subject = serializers.err();
			done();
		});

		t1.it('does not act on plain objects', () => {
			const x = {};
			const a = [];
			const res1 = subject(x);
			const res2 = subject(a);
			assert.isEqual(0, Object.keys(res1).length);
			assert.isEqual(0, Object.keys(res2).length);
			assert.isEqual(x, res1);
			assert.isEqual(a, res2);
		});

		t1.it('detects objects with a .stack property', () => {
			// Use Object.create(null) to avoid inheriting a constructor name.
			// (see next test)
			const err = Object.create(null);
			err.stack = 'foo';

			const res = subject(err);

			assert.isNotEqual(err, res);
			assert.isEqual(3, Object.keys(res).length);
			assert.isUndefined(res.name);
			assert.isUndefined(res.code);
			assert.isEqual('foo', res.stack);
		});

		t1.it('uses class name as default name', () => {
			class MyError {
				constructor() {
					this.stack = 'foo';
				}
			}

			const err = new MyError();
			const res = subject(err);

			assert.isNotEqual(err, res);
			assert.isEqual(3, Object.keys(res).length);
			assert.isEqual('MyError', res.name);
			assert.isUndefined(res.code);
			assert.isEqual('foo', res.stack);
		});

		t1.it('uses name prop if available', () => {
			class MyError {
				constructor() {
					this.name = 'NotMyError';
					this.stack = 'foo';
				}
			}

			const err = new MyError();
			const res = subject(err);

			assert.isNotEqual(err, res);
			assert.isEqual(3, Object.keys(res).length);
			assert.isEqual('NotMyError', res.name);
			assert.isUndefined(res.code);
			assert.isEqual('foo', res.stack);
		});

		t1.it('exposes the code prop if there is one', () => {
			const err = { code: 123, stack: 'foo' };

			const res = subject(err);

			assert.isNotEqual(err, res);
			assert.isEqual(3, Object.keys(res).length);
			assert.isEqual('Object', res.name);
			assert.isEqual(123, res.code);
			assert.isEqual('foo', res.stack);
		});

		t1.it('detects error types', () => {
			const err1 = new Error('test error type 1');
			const err2 = new TypeError('test error type 2');
			const res1 = subject(err1);
			const res2 = subject(err2);

			assert.isNotEqual(err1, res1);
			assert.isNotEqual(err2, res2);

			assert.isUndefined(res1.code);
			assert.isUndefined(res2.code);

			assert.isEqual('Error', res1.name);
			assert.isEqual('TypeError', res2.name);
		});

		t1.it('detects instances even without a stack', () => {
			class MyError extends Error {
				constructor(msg) {
					super(msg);
				}
			}

			const err1 = new MyError('test error type 1');
			const err2 = new TypeError('test error type 2');

			delete err1.stack;
			delete err2.stack;

			assert.isUndefined(err1.stack);
			assert.isUndefined(err2.stack);

			const res1 = subject(err1);
			const res2 = subject(err2);

			assert.isNotEqual(err1, res1);
			assert.isNotEqual(err2, res2);

			assert.isUndefined(res1.code);
			assert.isUndefined(res2.code);

			assert.isEqual('Error', res1.name);
			assert.isEqual('TypeError', res2.name);
		});
	});
};
