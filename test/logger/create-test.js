'use strict';

const { assert } = require('kixx-assert');

module.exports = (t) => {
	t.describe('typical execution', (t1) => {
		t1.it('is not smoking', () => {
			assert.isOk(false, 'smoke');
		});
	});
};
