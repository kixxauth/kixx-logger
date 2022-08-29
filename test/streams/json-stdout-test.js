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
const ISO_DATE_CHECK = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

module.exports = (t) => {
	t.describe('JsonStdoutStream with default fields', (t1) => {
		const hostname = os.hostname();
		const pid = process.pid;

		t1.before((done) => {
			sinon.stub(process.stdout, 'write').callsFake(noop);

			const logger = Logger.create({
				name: 'root',
				level: Logger.Levels.TRACE,
				stream: streams.JsonStdout.create(),
			});

			logger.trace('default fields');
			logger.debug('default fields');
			logger.info('default fields');
			logger.warn('default fields');
			logger.error('default fields');
			logger.fatal('default fields');

			// Introduce some delay to catch the async call.
			return delay(60).then(done);
		});

		t1.after((done) => {
			sinon.restore();
			done();
		});

		t1.it('writes the expected number of times', () => {
			assert.isEqual(6, process.stdout.write.callCount);
		});

		t1.it('writes expected output strings', () => {
			const args = process.stdout.write.getCalls().map((call) => {
				return call.args[0];
			});

			assert.isEqual(6, args.length);

			const records = args.map((str) => {
				assert.isEqual('string', typeof str);
				assert.isOk(str.endsWith(EOL));
				return JSON.parse(str.trim());
			});

			const now = new Date();
			let time;

			const expectedLevels = [
				10,
				20,
				30,
				40,
				50,
				60,
			];

			records.forEach((record, index) => {
				assert.isEqual(DEFAULT_NAME, record.name);
				assert.isEqual(hostname, record.hostname);
				assert.isEqual(pid, record.pid);
				assert.isMatch(ISO_DATE_CHECK, record.time);
				// Check the time field accuracy by simply checking the date portion of the ISO string.
				time = new Date(record.time);
				assert.isEqual(now.getDate(), time.getDate());
				assert.isEqual(expectedLevels[index], record.level);
				assert.isEqual('default fields', record.msg);
			});
		});
	});

	t.describe('JsonStdoutStream with additional fields', (t1) => {
		const hostname = os.hostname();
		const pid = process.pid;

		t1.before((done) => {
			sinon.stub(process.stdout, 'write').callsFake(noop);

			const logger = Logger.create({
				name: 'root',
				level: Logger.Levels.TRACE,
				stream: streams.JsonStdout.create(),
			});

			logger.trace('additional fields', { foo: [{ bar: 'baz' }, 1, false ] });
			logger.debug('additional fields', { foo: [{ bar: 'baz' }, 1, false ] });
			logger.info('additional fields', { foo: [{ bar: 'baz' }, 1, false ] });
			logger.warn('additional fields', { foo: [{ bar: 'baz' }, 1, false ] });
			logger.error('additional fields', { foo: [{ bar: 'baz' }, 1, false ] });
			logger.fatal('additional fields', { foo: [{ bar: 'baz' }, 1, false ] });

			// Introduce some delay to catch the async call.
			return delay(60).then(done);
		});

		t1.after((done) => {
			sinon.restore();
			done();
		});

		t1.it('writes the expected number of times', () => {
			assert.isEqual(6, process.stdout.write.callCount);
		});

		t1.it('writes expected output strings', () => {
			const args = process.stdout.write.getCalls().map((call) => {
				return call.args[0];
			});

			assert.isEqual(6, args.length);

			const records = args.map((str) => {
				assert.isEqual('string', typeof str);
				assert.isOk(str.endsWith(EOL));
				return JSON.parse(str.trim());
			});

			const now = new Date();
			let time;

			const expectedLevels = [
				10,
				20,
				30,
				40,
				50,
				60,
			];

			records.forEach((record, index) => {
				assert.isEqual(DEFAULT_NAME, record.name);
				assert.isEqual(hostname, record.hostname);
				assert.isEqual(pid, record.pid);
				assert.isMatch(ISO_DATE_CHECK, record.time);
				// Check the time field accuracy by simply checking the date portion of the ISO string.
				time = new Date(record.time);
				assert.isEqual(now.getDate(), time.getDate());
				assert.isEqual(expectedLevels[index], record.level);
				assert.isEqual('additional fields', record.msg);
				assert.isEqual('baz', record.foo[0].bar);
				assert.isEqual(1, record.foo[1]);
				assert.isEqual(false, record.foo[2]);
			});
		});
	});

	t.describe('JsonStdoutStream with circular reference', (t1) => {
		t1.before((done) => {
			sinon.stub(process.stdout, 'write').callsFake(noop);

			const logger = Logger.create({
				name: 'root',
				stream: streams.JsonStdout.create(),
			});

			const myObject = {
				foo: 'bar',
				bar: 'baz',
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
			const firstPart = `{"name":"${ DEFAULT_NAME }","hostname":"${ hostname }","pid":${ pid },"time":"${ time }","level":30,"msg":"circular fields"`;
			assert.isEqual(`${ firstPart },"foo":"bar","bar":"baz","circ":{"foo":"bar","bar":"baz","circ":"[Circular reference]"}}${ EOL }`, args[0]);
		});
	});

	t.describe('JsonStdoutStream with getter error', (t1) => {
		t1.before((done) => {
			sinon.stub(process.stdout, 'write').callsFake(noop);

			const logger = Logger.create({
				name: 'root',
				stream: streams.JsonStdout.create(),
			});

			const myObject = {
				foo: 'bar',
				bar: 'baz',
				get baz() {
					throw new Error('Getter error');
				},
			};

			logger.info('getter with error', myObject);

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
			const firstPart = `{"name":"${ DEFAULT_NAME }","hostname":"${ hostname }","pid":${ pid },"time":"${ time }","level":30,"msg":"getter with error"`;
			assert.isEqual(`${ firstPart },"foo":"bar","bar":"baz","baz":"[Getter for \\"baz\\" throws: Error: Getter error]"}${ EOL }`, args[0]);
		});
	});

	t.describe('JsonStdoutStream with toJSON() error', (t1) => {
		t1.before((done) => {
			sinon.stub(process.stdout, 'write').callsFake(noop);

			const logger = Logger.create({
				name: 'root',
				stream: streams.JsonStdout.create(),
			});

			const myObject = {
				foo: 'bar',
				bar: 'baz',
				baz: {
					toJSON() {
						throw new Error('Custom JSON error');
					},
				},
			};

			logger.info('toJSON() with error', myObject);

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
			const firstPart = `{"name":"${ DEFAULT_NAME }","hostname":"${ hostname }","pid":${ pid },"time":"${ time }","level":30,"msg":"toJSON() with error"`;
			assert.isEqual(`${ firstPart },"foo":"bar","bar":"baz","baz":"[toJSON() for \\"baz\\" throws: Error: Custom JSON error]"}${ EOL }`, args[0]);
		});
	});

	t.describe('JsonStdoutStream with array containing accessor exceptions', (t1) => {
		t1.before((done) => {
			sinon.stub(process.stdout, 'write').callsFake(noop);

			const logger = Logger.create({
				name: 'root',
				stream: streams.JsonStdout.create(),
			});

			const getterErrorObj = {
				get baz() {
					throw new Error('Getter error');
				},
			};

			const toJSONErrorObj = {
				toJSON() {
					throw new Error('Custom JSON error');
				},
			};

			const nestedJSONGetterError = {
				toJSON() {
					return getterErrorObj;
				},
			};

			const myObject = {
				foo: 'bar',
				bar: [
					{ baz: 'foo' },
					getterErrorObj,
					toJSONErrorObj,
					nestedJSONGetterError,
				],
			};

			logger.info('Nested Array errors', myObject);

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
			const firstPart = `{"name":"${ DEFAULT_NAME }","hostname":"${ hostname }","pid":${ pid },"time":"${ time }","level":30,"msg":"Nested Array errors"`;
			assert.isEqual(`${ firstPart },"foo":"bar","bar":[{"baz":"foo"},{"baz":"[Getter for \\"baz\\" throws: Error: Getter error]"},"[toJSON() for \\"2\\" throws: Error: Custom JSON error]","[Circular reference]"]}${ EOL }`, args[0]);
		});
	});
};
