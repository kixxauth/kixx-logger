'use strict';

const { Transform } = require('stream');

class MockStream extends Transform {
	constructor() {
		super({ objectMode: true });
	}

	init() {
	}

	_transform(rec, encoding, callback) {
		callback(null, rec);
	}

	static create() {
		return new MockStream();
	}
}

exports.MockStream = MockStream;
