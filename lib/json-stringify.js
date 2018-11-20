'use strict';

function catchCycles() {
	const seen = new Set();

	return function (key, val) {
		if (!val || typeof val !== 'object') {
			return val;
		}

		if (seen.has(val)) {
			return '[Circular]';
		}

		seen.add(val);
		return val;
	};
}

module.exports = function jsonStringify(obj, spacing) {
	try {
		return JSON.stringify(obj, null, spacing);
	} catch (err) {
		return JSON.stringify(obj, catchCycles(), spacing);
	}
};
