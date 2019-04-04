'use strict';

const { assert } = require('kixx-assert');

const { Logger } = require('../../');


module.exports = (test) => {
	test.describe('Logger.Levels enum', (t) => {
		let desc;

		t.before((done) => {
			desc = Object.getOwnPropertyDescriptor(logger, 'Levels');
			done();
		});

		t.it('is enumerable', () => {
			assert.isOk(desc.enumerable);
		});

		t.it('is not writable', () => {
			assert.isNotOk(desc.writable);
		});

		t.it('is not configurable', () => {
			assert.isNotOk(desc.writable);
		});

		t.it('is frozen', () => {
			assert.isOk(Object.isFrozen(Logger.Levels));
		});

		t.it('has expected keys', () => {
			const keys = Object.keys(Logger.Levels);
			assert.isEqual(6, keys.length);

			assert.isEqual(10, Logger.Levels.TRACE);
			assert.isEqual(20, Logger.Levels.DEBUG);
			assert.isEqual(30, Logger.Levels.INFO);
			assert.isEqual(40, Logger.Levels.WARN);
			assert.isEqual(50, Logger.Levels.ERROR);
			assert.isEqual(60, Logger.Levels.FATAL);
		});
	});
};
