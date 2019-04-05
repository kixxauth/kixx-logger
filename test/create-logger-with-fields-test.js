'use strict';

const { assert } = require('kixx-assert');
const sinon = require('sinon');

const { createLogger } = require('../');


module.exports = (test) => {

	function noop() {
	}

	test.describe('createLogger() with custom fields', (t) => {
		let logger;
		let stream;
		const PID = process.pid;
		const HOSTNAME = 'foo.bar.baz';
		const FOO = { foo: 'bar' };

		t.before((done) => {
			logger = createLogger({ fields: {
				name: 'foobar',
				hostname: HOSTNAME,
				foo: FOO
			} });

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

		t.it('has default name', () => {
			assert.isEqual('root', logger.fields.name);
		});

		t.it('has default pid', () => {
			assert.isNonEmptyString(PID, 'process.pid is a string');
			assert.isEqual(PID, logger.fields.pid);
		});

		t.it('has custom hostname', () => {
			assert.isEqual(HOSTNAME, logger.fields.hostname);
		});

		t.it('has custom field', () => {
			assert.isNotEmpty(FOO);
			assert.isEqual(FOO, logger.fields.foo);
		});

		t.it('writes to the stream for all log calls', () => {
			assert.isEqual(6, stream.write.callCount);
		});

		t.it('writes the name field for each log call', () => {
			const names = stream.write.getCalls().map((call) => {
				return call.args[0].name;
			});

			assert.isEqual(6, names.length);

			names.forEach((name) => {
				assert.isEqual('root', name);
			});
		});

		t.it('writes the custom hostname field for each log call', () => {
			const hostnames = stream.write.getCalls().map((call) => {
				return call.args[0].hostnames;
			});

			assert.isEqual(6, hostnames.length);

			assert.isNonEmptyString(HOSTNAME);

			hostnames.forEach((hostname) => {
				assert.isEqual(HOSTNAME, hostname);
			});
		});

		t.it('writes the pid field for each log call', () => {
			const pids = stream.write.getCalls().map((call) => {
				return call.args[0].pid;
			});

			assert.isEqual(6, pids.length);

			assert.isNotEmpty(PID);

			pids.forEach((pid) => {
				assert.isEqual(PID, pid);
			});
		});

		t.it('writes the custom field for each log call', () => {
			const foos = stream.write.getCalls().map((call) => {
				return call.args[0].foo;
			});

			assert.isEqual(6, foos.length);

			assert.isNotEmpty(FOO);

			foos.forEach((foo) => {
				assert.isEqual(FOO, foo);
			});
		});
	});
};
