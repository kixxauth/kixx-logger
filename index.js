'use strict';

const Logger = require('./lib/logger');

exports.Logger = Logger;

exports.streams = {
	JsonStdout: require('./lib/streams/json-stdout')
};

exports.serializers = {
	err: require('./lib/serializers/err')
};

function composeDefaultSerializers(options) {
	return Object.keys(exports.serializers).reduce((serializers, key) => {
		serializers[key] = exports.serializers[key](options);
		return serializers;
	}, {});
}

// options.name
// options.level
// options.stream
// options.serializers
function createLogger(options) {
	options = options || {};

	const { name } = options;
	const level = options.level || Logger.DEBUG;

	if (!Logger.isValidLevelString(level)) {
		throw new Error(
			`createLogger(options) invalid options.level ${JSON.stringify(level)}`
		);
	}

	const prettyLevels = [
		Logger.TRACE,
		Logger.DEBUG
	];

	const stream = options.stream || exports.streams.JsonStdout.create({
		makePretty: prettyLevels.includes(level)
	});

	const serializers = options.serializers || composeDefaultSerializers(options);

	return Logger.create({
		name,
		level,
		stream,
		serializers
	});
}

exports.createLogger = createLogger;
