'use strict';

const { assert } = require('kixx-assert');
const sinon = require('sinon');
const { Logger, streams } = require('../../');
const os = require('os');

const { EOL } = os;

function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(null);
		}, ms);
	});
}

function noop() {
}

const DEFAULT_NAME = 'root';

module.exports = (t) => {
	t.describe('JSONStream with defaults', (t1) => {
		const hostname = os.hostname();
		const pid = process.pid;

		t1.before((done) => {
			sinon.stub(process.stdout, 'write').callsFake(noop);

			const logger = Logger.create({
				streams: [ streams.JSONStream.create() ]
			});

			logger.trace('default fields');
			logger.trace('additional fields', {
				foo: [ { bar: 'baz' }, 1, false ]
			});

			logger.debug('default fields');
			logger.debug('additional fields', {
				foo: [ { bar: 'baz' }, 1, false ]
			});

			logger.info('default fields');
			logger.info('additional fields', {
				foo: [ { bar: 'baz' }, 1, false ]
			});

			logger.warn('default fields');
			logger.warn('additional fields', {
				foo: [ { bar: 'baz' }, 1, false ]
			});

			logger.error('default fields');
			logger.error('additional fields', {
				foo: [ { bar: 'baz' }, 1, false ]
			});

			logger.fatal('default fields');
			logger.fatal('additional fields', {
				foo: [ { bar: 'baz' }, 1, false ]
			});

			// Introduce some delay to catch the async call.
			return delay(60).then(done);
		});

		t1.after((done) => {
			sinon.restore();
			done();
		});

		t1.it('writes the expected number of times', () => {
			assert.isEqual(12, process.stdout.write.callCount);
		});

		t1.it('writes expected output strings', () => {
			const args = process.stdout.write.getCalls().map((call) => call.args[0]);

			const levels = [
				Logger.Levels.TRACE,
				Logger.Levels.DEBUG,
				Logger.Levels.INFO,
				Logger.Levels.WARN,
				Logger.Levels.ERROR,
				Logger.Levels.FATAL,
			];

			assert.isEqual(12, args.length);

			args.forEach((str, i) => {
				assert.isEqual('string', typeof str);
				assert.isOk(str.endsWith(EOL));
				const record = JSON.parse(str.trim());

				assert.isEqual(DEFAULT_NAME, record.name);
				assert.isEqual(hostname, record.hostname);
				assert.isEqual(pid, record.pid);

				const time = new Date(record.time);
				const now = new Date();
				assert.isEqual(now.getDate(), time.getDate());

				const level = levels[Math.ceil(i / 2)];
				assert.isEqual(level, record.level);

				if (i % 2 === 1) {
					assert.isEqual('additional fields', record.msg);
					assert.isEqual('baz', record.foo[0].bar);
					assert.isEqual(1, record.foo[1]);
					assert.isEqual(false, record.foo[2]);
				} else {
					assert.isEqual('default fields', record.msg);
				}
			});
		});
	});

	t.describe('JSONStream with circular reference', (t1) => {
		t1.before((done) => {
			sinon.stub(process.stdout, 'write').callsFake(noop);

			const logger = Logger.create({
				streams: [ streams.JSONStream.create() ]
			});

			const myObject = {
				foo: 'bar',
				bar: 'baz'
			};

			myObject.circ = myObject;

			logger.info('circular fields', myObject);

			// Introduce some delay to catch the async call.
			return delay(10).then(done);
		});

		t1.after((done) => {
			sinon.restore();
			done();
		});

		t1.it('writes the expected number of times', () => {
			assert.isEqual(1, process.stdout.write.callCount);
		});

		t1.it('writes expected output', () => {
			const { args } = process.stdout.write.firstCall;
			assert.isOk(args[0].endsWith(EOL));
			const { hostname, pid, time } = JSON.parse(args[0].trim());
			const firstPart = `{"name":"${DEFAULT_NAME}","hostname":"${hostname}","pid":${pid},"time":"${time}","level":30,"msg":"circular fields"`;
			assert.isEqual(`${firstPart},"foo":"bar","bar":"baz","circ":{"foo":"bar","bar":"baz","circ":"[Circular]"}}${EOL}`, args[0]);
		});
	});
};
