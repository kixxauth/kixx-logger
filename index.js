'use strict';

const Logger = require('./lib/logger');

exports.Logger = Logger;

exports.streams = {
	JsonStdout: require('./lib/streams/json-stdout')
};

exports.serializers = {
	err: require('./lib/serializers/err')
};

function createLogger(options) {
	options = options || {};

	const { name } = options;
	const level = options.level || Logger.DEBUG;

	if (!Logger.isValidLevelString(level)) {
		throw new Error(
			`createLogger(options) invalid options.level ${JSON.stringify(level)}`
		);
	}

	const stream = options.stream || exports.streams.JsonStdout.create({
		makePretty: Logger.goLevel(Logger.DEBUG, level)
	});

	const serializers = options.serializers || exports.serializers;

	return Logger.create({
		name,
		level,
		stream,
		serializers
	});
}

exports.createLogger = createLogger;
