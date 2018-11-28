'use strict';

const { isNonEmptyString } = require('../utils');

module.exports = function () {
	return function serializeErr(obj) {
		if ((obj instanceof Error) || isNonEmptyString(obj.stack)) {
			return {
				name: obj.name || (obj.constructor && obj.constructor.name),
				code: obj.code,
				stack: obj.stack
			};
		}

		return obj;
	};
};
