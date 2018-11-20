'use strict';

const { isNonEmptyString } = require('../utils');

module.exports = function (options) {
	return function serializeErr(obj) {
		if (isNonEmptyString(obj.stack)) {
			return {
				name: obj.name,
				code: obj.code,
				stack: obj.stack
			};
		}

		return obj;
	};
};
