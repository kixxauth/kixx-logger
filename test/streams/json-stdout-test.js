'use strict';

const { assert } = require('kixx-assert');
const Sinon = require('sinon');
const { Logger, streams } = require('../../');
const { EOL } = require('os');

function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(null);
		}, ms);
	});
}

module.exports = (t) => {
	t.describe('JsonStdoutStream with defaults', (t1) => {
		const sandbox = Sinon.createSandbox();

		t1.before((done) => {
			sandbox.stub(process.stdout, 'write').callsFake(() => {});

			const logger = Logger.create({
				stream: streams.JsonStdout.create()
			});

			logger.info('default fields');

			logger.info('additional fields', {
				foo: [ { bar: 'baz' }, 1, false ]
			});

			// Introduce some delay to catch the async call.
			return delay(10).then(done);
		});

		t1.after((done) => {
			sandbox.restore();
			done();
		});

		t1.it('writes the expected number of times', () => {
			assert.isEqual(2, process.stdout.write.callCount);
		});

		t1.it('writes expected output string for default fields', () => {
			const { args } = process.stdout.write.firstCall;
			const { hostname, pid, time } = JSON.parse(args[0]);
			assert.isEqual(`{"name":"root","hostname":"${hostname}","pid":${pid},"time":"${time}","level":30,"msg":"default fields"}${EOL}`, args[0]);
		});

		t1.it('writes expected output string for additional fields', () => {
			const { args } = process.stdout.write.secondCall;
			const { hostname, pid, time } = JSON.parse(args[0]);
			assert.isEqual(`{"name":"root","hostname":"${hostname}","pid":${pid},"time":"${time}","level":30,"msg":"additional fields","foo":[{"bar":"baz"},1,false]}${EOL}`, args[0]);
		});
	});

	t.describe('JsonStdoutStream with makePretty=true', (t1) => {
		const sandbox = Sinon.createSandbox();

		t1.before((done) => {
			sandbox.stub(process.stdout, 'write').callsFake(() => {});

			const logger = Logger.create({
				stream: streams.JsonStdout.create({
					makePretty: true
				})
			});

			logger.info('default fields');

			logger.info('additional fields', {
				foo: [ { bar: 'baz' }, 1, false ]
			});

			// Introduce some delay to catch the async call.
			return delay(10).then(done);
		});

		t1.after((done) => {
			sandbox.restore();
			done();
		});

		t1.it('writes the expected number of times', () => {
			assert.isEqual(2, process.stdout.write.callCount);
		});

		t1.it('writes expected output string for default fields', () => {
			const { args } = process.stdout.write.firstCall;
			assert.isMatch(/^[\d]{4}-[\d]{2}-[\d]{2}T[\d]{2}:[\d]{2}:[\d]{2}.[\d]{3}Z\s-\sINFO\s\(30\)\s-\sroot\s-\sdefault\sfields$/, args[0].trim());
			assert.isOk(args[0].endsWith(EOL));
		});

		t1.it('writes expected output string for additional fields', () => {
			const { args } = process.stdout.write.secondCall;
			assert.isOk(args[0].endsWith(EOL));
			const lines = args[0].split(EOL).filter((x) => Boolean(x));

			assert.isEqual(2, lines.length);

			assert.isMatch(/^[\d]{4}-[\d]{2}-[\d]{2}T[\d]{2}:[\d]{2}:[\d]{2}.[\d]{3}Z\s-\sINFO\s\(30\)\s-\sroot\s-\sadditional\sfields\s-$/, lines[0]);

			assert.isEqual("{ foo: [ { bar: 'baz' }, 1, false ] }", lines[1]); // eslint-disable-line quotes
		});
	});

	t.describe('JsonStdoutStream with circular reference', (t1) => {
		const sandbox = Sinon.createSandbox();

		t1.before((done) => {
			sandbox.stub(process.stdout, 'write').callsFake(() => {});

			const logger = Logger.create({
				stream: streams.JsonStdout.create()
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
			sandbox.restore();
			done();
		});

		t1.it('writes the expected number of times', () => {
			assert.isEqual(1, process.stdout.write.callCount);
		});

		t1.it('writes expected output', () => {
			const { args } = process.stdout.write.firstCall;
			assert.isOk(args[0].endsWith(EOL));
			const { hostname, pid, time } = JSON.parse(args[0]);
			assert.isEqual(`{"name":"root","hostname":"${hostname}","pid":${pid},"time":"${time}","level":30,"msg":"circular fields","foo":"bar","bar":"baz","circ":{"foo":"bar","bar":"baz","circ":"[Circular]"}}${EOL}`, args[0]);
		});
	});

	t.describe('JsonStdoutStream with circular reference and makePretty', (t1) => {
		const sandbox = Sinon.createSandbox();

		t1.before((done) => {
			sandbox.stub(process.stdout, 'write').callsFake(() => {});

			const logger = Logger.create({
				stream: streams.JsonStdout.create({
					makePretty: true
				})
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
			sandbox.restore();
			done();
		});

		t1.it('writes the expected number of times', () => {
			assert.isEqual(1, process.stdout.write.callCount);
		});

		t1.it('writes expected output', () => {
			const { args } = process.stdout.write.firstCall;
			assert.isOk(args[0].endsWith(EOL));
			const lines = args[0].split(EOL).filter((x) => Boolean(x));

			assert.isEqual(4, lines.length);

			assert.isMatch(/^[\d]{4}-[\d]{2}-[\d]{2}T[\d]{2}:[\d]{2}:[\d]{2}.[\d]{3}Z\s-\sINFO\s\(30\)\s-\sroot\s-\scircular\sfields\s-$/, lines[0]);

			assert.isEqual("{ foo: 'bar',", lines[1]); // eslint-disable-line quotes
			assert.isEqual("  bar: 'baz',", lines[2]); // eslint-disable-line quotes
			assert.isEqual("  circ: { foo: 'bar', bar: 'baz', circ: [Circular] } }", lines[3]); // eslint-disable-line quotes
		});
	});
};
