import process from 'node:process';
import { describe } from 'kixx-test';
import { assertEqual, AssertionError } from 'kixx-assert';
import sinon from 'sinon';
import Logger from '../mod.js';


function assertThrows(fn, message) {
    try {
        fn();
    } catch (error) {
        if (!error.message.includes(message)) {
            throw new AssertionError(`Expected error message to include "${ message }", but got "${ error.message }"`);
        }
        return;
    }
    throw new AssertionError('Expected error to be thrown, but got no error');
}

describe('Logger', () => {
    describe('constructor', ({ it }) => {
        it('should create a logger with valid name', () => {
            const logger = new Logger({ name: 'test-logger' });
            assertEqual('test-logger', logger.name);
        });

        it('should throw error when name is not provided', () => {
            assertThrows(() => {
                new Logger();
            }, 'A logger must be provided with a name');
        });

        it('should throw error when name is not a string', () => {
            assertThrows(() => {
                new Logger({ name: 123 });
            }, 'A logger must be provided with a name');
        });

        it('should initialize with default level (INFO)', () => {
            const logger = new Logger({ name: 'test-logger' });
            assertEqual('INFO', logger.level);
        });

        it('should initialize with custom level', () => {
            const logger = new Logger({ name: 'test-logger', level: 'DEBUG' });
            assertEqual('DEBUG', logger.level);
        });

        it('should initialize with default mode (stdout)', () => {
            const logger = new Logger({ name: 'test-logger' });
            assertEqual('stdout', logger.mode);
        });

        it('should initialize with custom mode', () => {
            const logger = new Logger({ name: 'test-logger', mode: 'console' });
            assertEqual('console', logger.mode);
        });
    });

    describe('level property', ({ it }) => {
        it('should set and get level using string', () => {
            const logger = new Logger({ name: 'test-logger' });
            logger.level = 'warn';
            assertEqual('WARN', logger.level);
        });

        it('should set and get level using integer', () => {
            const logger = new Logger({ name: 'test-logger' });
            logger.level = 30; // WARN level
            assertEqual('WARN', logger.level);
        });

        it('should throw error for invalid level string', () => {
            const logger = new Logger({ name: 'test-logger' });
            assertThrows(() => {
                logger.level = 'INVALID';
            }, 'Logger:set level : "INVALID" is an invalid level name');
        });

        it('should throw error for invalid level integer', () => {
            const logger = new Logger({ name: 'test-logger' });
            assertThrows(() => {
                logger.level = 999;
            }, 'Logger:set level : 999 is an invalid level integer');
        });
    });

    describe('mode property', ({ it }) => {
        it('should set and get mode', () => {
            const logger = new Logger({ name: 'test-logger' });
            logger.mode = 'console';
            assertEqual('console', logger.mode);
        });

        it('should throw error for invalid mode', () => {
            const logger = new Logger({ name: 'test-logger' });
            assertThrows(() => {
                logger.mode = 'invalid';
            }, 'Logger:set mode : "invalid" is an invalid mode');
        });
    });

    describe('createChild', ({ it }) => {
        it('should create a child logger with correct name', () => {
            const parent = new Logger({ name: 'parent' });
            const child = parent.createChild('child');
            assertEqual('parent:child', child.name);
        });

        it('should inherit parent level', () => {
            const parent = new Logger({ name: 'parent', level: 'warn' });
            const child = parent.createChild('child');
            assertEqual('WARN', child.level);
        });

        it('should inherit parent mode', () => {
            const parent = new Logger({ name: 'parent', mode: 'stdout' });
            const child = parent.createChild('child');
            assertEqual('stdout', child.mode);
        });

        it('should throw error when child name is not provided', () => {
            const parent = new Logger({ name: 'parent' });
            assertThrows(() => {
                parent.createChild();
            }, 'Logger:createChild(name) name: must be a string');
        });

        it('should throw error when child name is not a string', () => {
            const parent = new Logger({ name: 'parent' });
            assertThrows(() => {
                parent.createChild(123);
            }, 'Logger:createChild(name) name: must be a string');
        });
    });

    describe('logging methods', ({ describe }) => { // eslint-disable-line no-shadow

        describe('when the level is INFO', ({ before, after, it }) => {
            let sandbox;

            before(() => {
                sandbox = sinon.createSandbox();
            });

            after(() => {
                sandbox.restore();
            });

            it('should not log debug message', () => {
                const logger = new Logger({ name: 'test-logger', level: Logger.LEVELS.INFO });
                const spy = sandbox.stub(process.stdout, 'write');

                logger.debug('test message');
                assertEqual(0, spy.callCount);
                logger.info('test message');
                logger.warn('test message');
                logger.error('test message');
                assertEqual(3, spy.callCount);
            });
        });

        describe('when the level is DEBUG', ({ before, after, it }) => {
            let sandbox;

            before(() => {
                sandbox = sinon.createSandbox();
            });

            after(() => {
                sandbox.restore();
            });

            it('should log all messages at all levels', () => {
                const logger = new Logger({ name: 'test-logger', level: Logger.LEVELS.DEBUG });
                const spy = sandbox.stub(process.stdout, 'write');

                logger.debug('test message');
                logger.info('test message');
                logger.warn('test message');
                logger.error('test message');
                assertEqual(4, spy.callCount);
            });
        });

        describe('when the level is WARN', ({ before, after, it }) => {
            let sandbox;

            before(() => {
                sandbox = sinon.createSandbox();
            });

            after(() => {
                sandbox.restore();
            });

            it('should log all messages at all levels', () => {
                const logger = new Logger({ name: 'test-logger', level: Logger.LEVELS.WARN });
                const spy = sandbox.stub(process.stdout, 'write');

                logger.debug('test message');
                logger.info('test message');
                assertEqual(0, spy.callCount);
                logger.warn('test message');
                logger.error('test message');
                assertEqual(2, spy.callCount);
            });
        });

        describe('when the level is ERROR', ({ before, after, it }) => {
            let sandbox;

            before(() => {
                sandbox = sinon.createSandbox();
            });

            after(() => {
                sandbox.restore();
            });

            it('should log all messages at all levels', () => {
                const logger = new Logger({ name: 'test-logger', level: Logger.LEVELS.ERROR });
                const spy = sandbox.stub(process.stdout, 'write');

                logger.debug('test message');
                logger.info('test message');
                logger.warn('test message');
                assertEqual(0, spy.callCount);
                logger.error('test message');
                assertEqual(1, spy.callCount);
            });
        });
    });
});
