'use strict';

function isFunction(x) {
	return typeof x === 'function';
}
exports.isFunction = isFunction;

function isUndefined(x) {
	return typeof x === 'undefined';
}
exports.isUndefined = isUndefined;

function isNonEmptyString(x) {
	return x && typeof x === 'string';
}
exports.isNonEmptyString = isNonEmptyString;
