'use strict';

const Logger = require('./lib/logger');

exports.Logger = Logger;

exports.streams = { JsonStdout: require('./lib/streams/json-stdout') };
