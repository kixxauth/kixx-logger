'use strict';

const {
	isFunction,
	safelyAccessGetter,
} = require('./utils');

/*
This library is a derivative of [safe-json-stringify](https://github.com/debitoor/safe-json-stringify).

License
The MIT License (MIT)

Copyright (c) 2014-2017 [Debitoor](https://debitoor.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT
OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * Ensure that all properties throughout the node tree of this object can be safely accessed by
 * the JSON stringifier. Handle errors in object getters and toJSON() methods and assign useful
 * error strings instead.
 * @param {Any} obj
 * @return {Object} The resulting "safe" object for JSON serialization.
 */
function ensureProperties(obj) {
	let seen = new WeakSet();

	function visitNode(val, propName) {
		// We do not need to perform any of these checks for values which are not objects or null.
		if (!val || typeof val !== 'object') {
			return val;
		}

		// If we have already seen this object (by reference) then assume we have discovered a
		// circular reference and return a useful error string instead.
		if (seen.has(val)) {
			return '[Circular reference]';
		}

		// If an object has a toJSON() method present, then the JSON serializer will call it
		// automatically, which can be the source of a serialization error. Try calling it here
		// and return a useful string if it throws an error.
		if (isFunction(val.toJSON)) {
			let jsonVal;
			try {
				jsonVal = val.toJSON();
				seen.add(jsonVal);
				const r = visitNode(jsonVal, propName);
				seen.delete(jsonVal);
				return r;
			} catch (err) {
				seen.delete(jsonVal);
				const e = err || {};
				return `[toJSON() for "${ propName }" throws: ${ e.name || '?' }: ${ e.message || '?' }]`;
			}
		}

		seen.add(val);

		// If the object is an Array then create a new Array by mapping over the items in it, visiting
		// each node and walking the full node tree.
		if (Array.isArray(val)) {
			return val.map(visitNode);
		}

		// Walk the full node tree using a reducer.Iterate through the keys of an object and check
		// each property. Will return a copy of the original object.
		const resultJSON = Object.keys(val).reduce(function safeAccessReducer(result, key) {
			result[key] = visitNode(safelyAccessGetter(val, key), key);
			return result;
		}, {});

		seen.delete(val);

		return resultJSON;
	}

	const res = visitNode(obj, 'root');

	// Clear out the Set instance to signal to the garbage collector that it
	// can be cleaned up immediately.
	seen = null;

	return res;
}

function customSerializer(key, val) {
	if (typeof val === 'undefined') {
		return '[undefined]';
	}
	return val;
}

/**
 * Try to serialize an object using JSON.stringify(). If it fails, then walk the full object tree
 * and replace toJSON() and dereferencing errors with useful error strings in the JSON output.
 * @param  {Any} obj
 * @return {String} A valid JSON string.
 */
module.exports = function jsonStringify(obj) {
	try {
		// Try without using ensureProperties() to use the more optimized path first.
		return JSON.stringify(obj, customSerializer);
	} catch (err) {
		// If there is an error then walk the node tree of the object and safely access each node.
		return JSON.stringify(ensureProperties(obj), customSerializer);
	}
};
