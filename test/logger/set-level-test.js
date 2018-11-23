'use strict';

const { assert } = require('kixx-assert');
const Sinon = require('sinon');
const { Logger } = require('../../');

module.exports = (t) => {
	t.describe('Logger#setLevel()', (t1) => {
		t1.describe('with integer', (t2) => {
			const sandbox = Sinon.createSandbox();

			let subject;

			const stream = {
				write() {}
			};

			t2.before((done) => {
				sandbox.stub(stream, 'write');
				subject = Logger.create({ stream });
				// ERROR level = 50
				subject.setLevel(50);
				done();
			});

			t2.after((done) => {
				sandbox.restore();
				done();
			});

			t2.it('should set the appropriate level string', () => {
				assert.isNonEmptyString(Logger.ERROR);
				assert.isEqual(Logger.ERROR, subject.level);
			});

			t2.it('should emit only appropriate levels', () => {
				subject.trace('trace message');
				subject.debug('debug message');
				subject.info('info message');
				subject.warn('warn message');
				subject.error('error message');
				subject.fatal('fatal message');

				assert.isOk(stream.write.calledTwice, 'stream.write.calledTwice');

				const rec1 = stream.write.firstCall.args[0];
				const rec2 = stream.write.secondCall.args[0];

				assert.isEqual(Logger.ERROR, rec1.level);
				assert.isEqual(Logger.FATAL, rec2.level);
			});
		});

		t1.describe('with invalid integer', (t2) => {
			let subject;

			t2.before((done) => {
				subject = Logger.create();
				done();
			});

			t2.it('throws an error', () => {
				try {
					subject.setLevel(5);
				} catch (err) {
					assert.isEqual(
						'Logger#setLevel(newLevel) no level found for integer 5',
						err.message
					);
					return;
				}

				assert.isOk(false, 'should throw an error');
			});
		});

		t1.xdescribe('with string', (t2) => {
		});

		t1.describe('with invalid string', (t2) => {
			let subject;

			t2.before((done) => {
				subject = Logger.create();
				done();
			});

			t2.it('throws an error', () => {
				try {
					subject.setLevel('foo');
				} catch (err) {
					assert.isEqual(
						'Logger#setLevel(newLevel) invalid newLevel String "foo"',
						err.message
					);
					return;
				}

				assert.isOk(false, 'should throw an error');
			});
		});

		t1.xdescribe('with children', (t2) => {
		});

		t1.describe('with invalid argument', (t2) => {
			let subject;

			t2.before((done) => {
				subject = Logger.create();
				done();
			});

			t2.it('throws an error', () => {
				try {
					subject.setLevel();
				} catch (err) {
					assert.isEqual(
						'Logger#setLevel(newLevel) newLevel must be a String or Integer',
						err.message
					);
					return;
				}

				assert.isOk(false, 'should throw an error');
			});
		});
	});
};
