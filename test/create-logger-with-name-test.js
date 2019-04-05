'use strict';

const { assert } = require('kixx-assert');
const sinon = require('sinon');

const { createLogger } = require('../');


module.exports = (test) => {

	function noop() {
	}

	test.describe('createLogger() with custom name', (t) => {
		let logger;
		let stream;
		const NAME = 'Custom Name';

		t.before((done) => {
			logger = createLogger({ name: NAME });

			assert.isEqual(1, logger.streams.length);
			stream = logger.streams[0];

			sinon.stub(stream, 'write').callsFake(noop);

			logger.trace('trace level message');
			logger.debug('default fields');
			logger.info('with extra properties');
			logger.warn('yellow and orange');
			logger.error('with an error');
			logger.fatal('i quit');

			done();
		});

		t.after((done) => {
			sinon.restore();
			done();
		});

		t.it('writes to the stream for all log calls', () => {
			assert.isEqual(6, stream.write.callCount);
		});

		t.it('writes the name field for each log call', () => {
			const names = stream.write.getCalls().map((call) => {
				return call.args[0].name;
			});

			assert.isEqual(6, names.length);

			assert.isNonEmptyString(NAME);

			names.forEach((name) => {
				assert.isEqual(NAME, name);
			});
		});
	});
};
