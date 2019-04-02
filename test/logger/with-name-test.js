'use strict';

const { assert } = require('kixx-assert');
const sinon = require('sinon');

const { Logger } = require('../../');


module.exports = (t) => {
	const MSG = 'foo';

	t.describe('Logger with name prop', (t1) => {
		const NAME = 'xxx';

		let logger;

		const stream = {
			write: sinon.spy()
		};

		t1.before((done) => {
			logger = Logger.create({
				name: NAME,
				fields: {
					name: 'Another Name'
				},
				streams: [ stream ]
			});

			logger.trace(MSG);
			logger.debug(MSG);
			logger.info(MSG);
			logger.warn(MSG);
			logger.error(MSG);
			logger.fatal(MSG);

			done();
		});

		t1.after((done) => {
			sinon.restore();
			done();
		});

		t1.it('attaches the given name to the default fields', () => {
			assert.isEqual(NAME, logger.fields.name);
		});

		t1.it('uses the given name in log records', () => {
			const names = stream.write.getCalls().map((call) => {
				return call.args[0].name;
			});

			assert.isEqual(6, names.length);

			names.forEach((name) => {
				assert.isEqual(NAME, name);
			});
		});
	});

	t.describe('Logger without name prop', (t1) => {
		let logger;

		const stream = {
			write: sinon.spy()
		};

		t1.before((done) => {
			logger = Logger.create({
				fields: {
					name: 'Another Name'
				},
				streams: [ stream ]
			});

			logger.trace(MSG);
			logger.debug(MSG);
			logger.info(MSG);
			logger.warn(MSG);
			logger.error(MSG);
			logger.fatal(MSG);

			done();
		});

		t1.after((done) => {
			sinon.restore();
			done();
		});

		t1.it('fields.name is undefined', () => {
			assert.isUndefined(logger.fields.name);
		});

		t1.it('log records name field is undefined', () => {
			const names = stream.write.getCalls().map((call) => {
				return call.args[0].name;
			});

			assert.isEqual(6, names.length);

			names.forEach((name) => {
				assert.isUndefined(name);
			});
		});
	});
};
