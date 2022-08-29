'use strict';

/**
 * Is this value a function?
 * @param {Any} x
 * @return {Boolean}
 */
function isFunction(x) {
	return typeof x === 'function';
}

/**
 * Is this value undefined? The null and NaN values will return false.
 * @param  {Any} x
 * @return {Boolean}
 */
function isUndefined(x) {
	return typeof x === 'undefined';
}

/**
 * Is this value null, NaN or undefined?
 * @param  {Any} x
 * @return {Boolean} Will return true for NaN.
 */
function isNullOrUndefined(x) {
	return x === null || Number.isNaN(x) || typeof x === 'undefined';
}

/**
 * Is this a string and is it NOT empty?
 * @param  {Any} x
 * @return {Boolean}
 */
function isNonEmptyString(x) {
	return x && typeof x === 'string';
}

/**
 * Attempt to dereference an object property, potentially triggering an error the getter. Handle
 * the error and return a useful error String instead.
 * @param  {Object} obj The source object
 * @param  {String} key The property name to dereference.
 * @return {Any} The dereferenced property value or a useful error string.
 */
function safelyAccessGetter(obj, key) {
	try {
		return obj[key];
	} catch (err) {
		const e = err || {};
		return `[Getter for "${ key }" throws: ${ e.name || '?' }: ${ e.message || '?' }]`;
	}
}

/**
 * Using Object.assign() can fail when an object property getter throws an error. This utility
 * safely assigns the source properties to the target object by assigning a useful error String
 * if a getter fails.
 * @see {@link safelyAccessGetter}
 * @param {Object} target
 * @param {Object} source
 * @return {Object} Returns the target object.
 */
function safelyAssignProps(target, source) {
	if (isNullOrUndefined(source)) {
		return target;
	}

	return Object.keys(source).reduce((result, key) => {
		result[key] = safelyAccessGetter(source, key);
		return result;
	}, target);
}

exports.isFunction = isFunction;
exports.isUndefined = isUndefined;
exports.isNullOrUndefined = isNullOrUndefined;
exports.isNonEmptyString = isNonEmptyString;
exports.safelyAccessGetter = safelyAccessGetter;
exports.safelyAssignProps = safelyAssignProps;
