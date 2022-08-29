'use strict';

class ArgumentError extends Error {

	constructor(message, sourceFunction) {
		super(message);

		Object.defineProperties(this, {
			name: {
				enumerable: true,
				value: 'KixxLoggerArgumentError',
			},
			message: {
				enumerable: true,
				value: message,
			},
		});

		if (Error.captureStackTrace && sourceFunction) {
			Error.captureStackTrace(this, sourceFunction);
		}
	}
}

module.exports = ArgumentError;
