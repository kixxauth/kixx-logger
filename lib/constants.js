'use strict';

const LEVEL_STRINGS = Object.freeze({
	TRACE: 'trace',
	DEBUG: 'debug',
	INFO: 'info',
	WARN: 'warn',
	ERROR: 'error',
	FATAL: 'fatal',
});

const LEVEL_NUMBERS = Object.freeze({
	TRACE: 10,
	DEBUG: 20,
	INFO: 30,
	WARN: 40,
	ERROR: 50,
	FATAL: 60,
});

exports.LEVEL_STRINGS = LEVEL_STRINGS;
exports.LEVEL_NUMBERS = LEVEL_NUMBERS;
