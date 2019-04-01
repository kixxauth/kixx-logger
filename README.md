Kixx Logger
===========
A logger for Node.js

## Example
Default logger examples with default output and prettified output.

```js
const { createLogger } = require('kixx-logger');

const logger = createLogger();
```

```js
// TRACE
logger.trace('trace message');

// default stdout:
// {"time":"2030-03-27T13:07:16.221Z","level":10,"msg":"trace message","name":"root","hostname":"kixxauths-Mac-mini.local","pid":38010}

// prettified stdout:
// 09:07:16.221 TRACE root "trace message"
```

```js
// DEBUG
logger.debug('debug message with custom property', {elapsed: 10});

// default stdout:
// {"time":"2030-03-27T13:07:16.227Z","level":20,"msg":"debug message with custom property","name":"root","hostname":"kixxauths-Mac-mini.local","pid":38010,"elapsed":10}

// prettified stdout:
// 09:07:16.227 DEBUG root "debug message with custom property" { elapsed: 10 }
```

```js
// INFO
logger.info('log message with custom object', {req: {
    url: '/foo/index.html',
    method: 'GET'
}});

// default stdout:
// {"time":"2030-03-27T13:07:16.232Z","level":30,"msg":"log message with custom object","name":"root","hostname":"kixxauths-Mac-mini.local","pid":38010,"req":{"url":"/foo/index.html","method":"GET"}}

// prettified stdout:
// 09:07:16.232 INFO root "log message with custom object" { req: { url: '/foo/index.html', method: 'GET' } }
```

```js
// WARN
logger.warn('warning message');

// default stdout:
// {"time":"2030-03-27T13:07:16.241Z","level":40,"msg":"warning message","name":"root","hostname":"kixxauths-Mac-mini.local","pid":38010}

// prettified stdout:
// 09:07:16.241 WARN root "warning message"
```

```js
// ERROR
logger.error('error message with Error', { err: new Error('Something bad happened') });

// default stdout:
// {"time":"2030-03-27T13:07:16.252Z","level":50,"msg":"error message with Error","name":"root","hostname":"kixxauths-Mac-mini.local","pid":38010,"err":{"name":"Error","message":"Something bad happened","stack":"Error: Something bad happened\n    at repl:1:11\n    at ContextifyScript.Script.runInThisContext (vm.js:50:33)\n    at REPLServer.defaultEval (repl.js:240:29)\n    at bound (domain.js:301:14)\n    at REPLServer.runBound [as eval] (domain.js:314:12)\n    at REPLServer.onLine (repl.js:468:10)\n    at emitOne (events.js:121:20)\n    at REPLServer.emit (events.js:211:7)\n    at REPLServer.Interface._onLine (readline.js:280:10)\n    at REPLServer.Interface._line (readline.js:629:8)"}}

// prettified stdout:
// 09:07:16.252 ERROR root "error message with Error" {
//     name: 'Error',
//     message: 'Something bad happened',
//     code: undefined,
//     stack: 'Error: Something bad happened
//        at repl:1:11
//        at ContextifyScript.Script.runInThisContext (vm.js:50:33)
//        at REPLServer.defaultEval (repl.js:240:29)
//        at bound (domain.js:301:14)
//        at REPLServer.runBound [as eval] (domain.js:314:12)'
// }
```

```js
// FATAL
logger.fatal('crashing');
// default stdout:
// {"time":"2030-03-27T13:07:16.261Z","level":60,"msg":"crashing","name":"root","hostname":"kixxauths-Mac-mini.local","pid":38010}

// prettified stdout:
// 09:07:16.261 FATAL root "crashing"
```

## Create Logger
__createLogger()__ Create a new Logger instance with passed options. Shown passing the defaults here:
```js
const { createLogger, Logger, serializers, fields, JSONStream } = require('kixx-logger');

const logger = createLogger({
    name: 'root',
    level: Logger.Levels.TRACE,
    serializers: {
        err: serializers.err
    },
    fields: {
        hostname: fields.hostname,
        pid: fields.pid
    },
    streams: [ new JSONStream() ],
    pretty: false
});
```

### Options
__createLogger(options)__

- __options.name__ (default="root"): The name String of the logger. This will populate the `name` field on log output records.
- __options.level__ (default=Logger.Levels.TRACE): A level Integer or String. This will control which log records are output. See [Log Levels](#log-levels) below.
- __options.serializers__ (default=serializers): An Object of serializers which map to log record fields. See [Serializers](#serializers) below.
- __options.fields__ (default=fields): An Object of values which should be included in log records by default. See [Fields](#fields) below.
- __options.streams__ (default=Array<JSONStream>): An Array of Node.js writable Streams to use for log output. See [Streams](#streams) below.
- __options.pretty__ (default=false): If true and the default streams are used then use the PrettyStream instead of the JSONStream. If you pass in your own streams Array, this option will be ignored.

## Log Levels
By default, a logger is set at the TRACE level, which means all of these will produce output:
```js
const { createLogger, Logger } = require('kixx-logger');

const logger = createLogger();

logger.level; // 10
logger.levelString; // 'TRACE'

logger.trace('trace message');
logger.debug('debug message');
logger.info('info message');
logger.warn('warning message');
logger.error('error message');
logger.fatal('fatal message');
```

Available levels are referenced on the static `Levels` property on the Logger Object:
```js
Logger.Levels.TRACE; // 10
Logger.Levels.DEBUG; // 20
Logger.Levels.INFO; // 30
Logger.Levels.WARN; // 40
Logger.Levels.ERROR; // 50
Logger.Levels.FATAL; // 60

Logger.levelToString(Logger.Levels.TRACE); // "TRACE"
Logger.levelToString(Logger.Levels.DEBUG); // "DEBUG"
Logger.levelToString(Logger.Levels.INFO); // "INFO"
Logger.levelToString(Logger.Levels.WARN); // "WARN"
Logger.levelToString(Logger.Levels.ERROR); // "ERROR"
Logger.levelToString(Logger.Levels.FATAL); // "FATAL"

logger.level === Logger.Levels.TRACE; // true
logger.levelString === Logger.levelToString(Logger.Levels.TRACE); // true
```

At any point in your application you can change the log level for a logger.
```js
logger.setLevel(Logger.Levels.WARN);

logger.level; // 40
logger.levelString; // 'WARN'

// No longer produce output:
logger.trace('trace message');
logger.debug('debug message');
logger.info('info message');

// Continue to produce output:
logger.warn('warning message');
logger.error('error message');
logger.fatal('fatal message');
```

You can create a logger at a different level by passing `options.level`:
```js
const logger = createLogger({
    level: Logger.Levels.INFO
});

logger.level; // 30
logger.levelString: // "INFO"
```

## Serializers
Each log method (`trace()`, `debug()`, `info()`, `warn()`, `error()`, `fatal()`) emits a log record. A log record is then serialized to the chosen output stream, typically using the default JSONStream to `process.stdout` (see [Streams](#streams) below). Using custom serializers enable you to modify the fields in the log record before it is output by a stream.

Serializer keys must match the names of the log record fields they are meant to serialize. A serializer must be a function which takes an options Object as input and returns a nested function which takes the field value as input and returns a new Object or primitive value.

Here is an example of creating a logger with a serializer added to serialize Node.js IncomingRequest instances:

```js
const { createLogger, serializers } = require('kixx-logger');

function requestSerializer(options) {
    return function (req) {
        const r = {
            method: req.method,
            path: req.url.split('?')[0],
            query: req.url.split('?')[1] || ''
        };

        if (options.requestHeaders) {
            r.headers = req.headers;
        }

        return r;
    };
}

// Or, define your serializer the new, fancy way:
const requestSerializer = (options) => (req) => {
    const r = {
        method: req.method,
        path: req.url.split('?')[0],
        query: req.url.split('?')[1] || ''
    };

    if (options.requestHeaders) {
        r.headers = req.headers;
    }

    return r;
};

const customSerializers = Object.assign({}, serializers, {
    req: requestSerializer
});

const logger = createLogger({
    name: 'request',
    serializers: customSerializers,
    requestHeaders: true
});
```

With the default JSONStream output the above serializer would result in this:
```js
const http = require('http');

const server = http.createServer((req, res) => {
    logger.info('web request', { req });
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('request logged');
});

server.listen();

// Log output would look like this:
// {"time":"2030-03-27T18:09:16.227Z","level":30,"msg":"web request","name":"request","hostname":"kixxauths-Mac-mini.local","pid":38010,"req"{"method":"GET","path":"/get/something","query":"foo=bar","headers":{"host":"localhost:8080","user-agent":"curl/7.54.0","accept":"*/*"}}}
```

## Fields
Each log method (`trace()`, `debug()`, `info()`, `warn()`, `error()`, `fatal()`) emits a log record. A log record is made up of fields, which may be nested.

There are default fields added to every log record:

- __name__ : The name String of the logger.
- __hostname__ : The string derived from `require('os').hostname()`.
- __pid__ : The `process.pid` value.

Except for `name`, you can override the default fields or add your own. The `name` field is internally overridden to use the logger name.
```js
const { createLogger, fields } = require('kixx-logger');

const customFields = Object.assign({}, fields, {
    hostname: 'foo.bar.baz',
    env: process.env.NODE_ENV || 'development'
});

const logger = createLogger({
    name: 'Foo',
    fields: customFields
});

logger.info('application started');

// Log output would look like this:
// {"time":"2030-03-27T14:07:16.221Z","level":30,"msg":"application started","name":"Foo","hostname":"foo.bar.baz","pid":38010,"env":"development"}
```

## Streams
Streams are Node.js Writable Streams which take log records emitted by each log method (`trace()`, `debug()`, `info()`, `warn()`, `error()`, `fatal()`) and output a serialized version of it somewhere, usually to stdout. The default stream (JSONStream) outputs log records serialized as JSON text to stdout. A logger may have multiple streams attached to it, and it will output log records to all of them simultaneously.

Log records passed to a writable stream have a specific shape:

```js
{
    time: new Date(), // The current date-time as a JavaScript Date instance.
    level: 30, // The log level Integer of the logging method called (30 is info).
    msg: "some log message", // The message String passed into the log method.
    name: "logger_name" // The name String of the logger used to log the method.
}
```

Other fields are added to the log record if they are defined before being passed into the output streams. The default fields are `hostname` and `pid`, but you can add more of your own (see [Fields](#fields) above).

Because a stream needs to accept log record Objects, it must be set to object mode:
```js
const { Writable } = require('stream');

class MyOutputStream extends Writable {
    constructor(options) {
        super({ objectMode: true });
    }
}
```

You can set a `level` property on your stream, which will filter it to only that level and higher. So, for a stream set `stream.level = Logger.Levels.ERROR` the stream will only receive log records for the ERROR and FATAL levels.

You add your stream to a logger by passing it in at construction time, or by adding it with the instance method `logger.addStream(stream)`. If your custom stream has an `init()` method, it will be called when the stream is added.

Here is an example of a very simple text output stream:
```js
const { EOL } = require('os');
const { Transform } = require('stream');
const { createLogger, Logger, JSONStream } = require('kixx-logger');

class MyOutputStream extends Transform {
    constructor(options) {
        super({ objectMode: true });
        this.level = Logger.Levels.TRACE;
    }

    init() {
        this.pipe(process.stdout);
    }

    _transform(record, encoding, callback) {
        const { time, level, name, message } = record;
        const timeString = time.toISOString();
        const levelString = Logger.levelToString(level);
        callback(`${timeString} ${name} ${levelString} ${message}${EOL}`);
    }
}

// Using your stream at construction time means the default JSONStream will
// not be used:
const logger = createLogger({
    streams: [new MyOutputStream()]
});

// You can use both the custom stream and the JSONStream at construction time:
const logger = createLogger({
    streams: [
        new MyOutputStream(),
        new JSONStream()
    ]
});

// Or, add it later:
logger.addStream(new MyOutputStream());
```

## Child Loggers
Each logger can create child loggers, which are clones of itself, but can have a different name, fields, serializers, and even streams attached. You use `logger.create()` to create a child logger which inherits all the properties of the parent. `logger.create()` has the same signature as the top level `createLogger()` and takes the same options, except that it no longer accepts the `pretty` Boolean.

The most common use case for this is to create different loggers for sub systems or classes within an application. Here is an example of a GitHub API client using a child logger. We start by creating a root logger at the application level.
```js
const { createLogger, Logger } = require('kixx-logger');

class Application {
    constructor(applicationName, environment) {
        this.logger = createLogger({
            name: applicationName,
            level: environment === 'development' ? Logger.Levels.TRACE : Logger.Levels.INFO,
            fields: { env: environment }
        });
    }
}
module.exports = Application;
```

Then create the sub component.
```js
class GitHubClient {
    constructor(application) {
        this.logger = application.logger.create({
            name: 'GitHubClient'
        });
    }

    makeRequest(endpoint, query) {
        this.logger.info('make request', { endpoint, query });
        // Implementation outside the scope of this example.
    }
}
```

## Reference
See [Create Logger](#create-logger) above for the top level `createLogger()` factory and options.

### Logger
- __Logger.Levels.TRACE__ The 'trace' log level Integer `10`
- __Logger.Levels.DEBUG__ The 'debug' log level Integer `20`
- __Logger.Levels.INFO__ The 'info' log level Integer `30`
- __Logger.Levels.WARN__ The 'warn' log level Integer `40`
- __Logger.Levels.ERROR__ The 'error' log level Integer `50`
- __Logger.Levels.FATAL__ The 'fatal' log level Integer `60`

__Logger.levelToString(<int>)__ Convert a log level integer to a log level string.
```js
Logger.levelToString(Logger.Levels.INFO) === 'info';
```

### Logger Instance
All log methods (trace, debug, info, log, warn, error, fatal) accept `message` and `obj` as parameters.

- __message__ - If it is not a String, it will be coerced into a String.
- __obj__ - Any Object. The own, enumerable keys will be assigned to the log record when it is emitted.

#### trace(message, obj)
Emit a log record at the trace level.
#### debug(message, obj)
Emit a log record at the debug level.
#### info(message, obj)
Emit a log record at the info level.
#### log(message, obj)
An alias to `info(message, obj)`.
#### warn(message, obj)
Emit a log record at the warn level.
#### error(message, obj)
Emit a log record at the error level.
#### fatal(message, obj)
Emit a log record at the fatal level.

#### create(options)
Create a child logger. Valid options are:

- __options.name__ (default="root"): The name String of the logger. This will populate the `name` field on log output records.
- __options.level__ (default=Logger.Levels.TRACE): A level Integer or String. This will control which log records are output. See [Log Levels](#log-levels) above.
- __options.serializers__ (default=serializers): An Object of serializers which map to log record fields. See [Serializers](#serializers) above.
- __options.fields__ (default=fields): An Object of values which should be included in log records by default. See [Fields](#fields) above.
- __options.streams__ (default=Array<JSONStream>): An Array of Node.js writable Streams to use for log output. See [Streams](#streams) above.

#### setLevel(level)
Set the level of this logger and all of its child loggers recursively. The `level` parameter may be a valid log level String or log level Integer. See [Log Levels](#log-levels) above.
```js
const logger = createLogger({ level: Logger.INFO });
const childLogger = logger.create({ name: 'child_logger' });
logger.level === 30;
childLogger.level === 30;

logger.setLevel('error');
logger.level === 50;
childLogger.level === 50;
```

#### mergeFields(fields)
Merge in default fields for this logger and all of its child loggers recursively. The `fields` parameter should be an Object where the top level, own, enumerable properties will be merged in as default fields. See [Fields](#fields) above.
```js
const logger = createLogger();
const childLogger = logger.create({ name: 'child_logger' });
logger.fields; // { hostname: 'foo.bar.baz', pid: 12345 }
childLogger.fields; // { hostname: 'foo.bar.baz', pid: 12345 }

logger.mergeFields({ env: 'stage' });
logger.fields; // { hostname: 'foo.bar.baz', pid: 12345, env: 'stage' }
childLogger.fields; // { hostname: 'foo.bar.baz', pid: 12345, env: 'stage' }
```

#### mergeSerializers(serializers)
Merge in default serializers for this logger and all of its child loggers recursively. The `serializers` parameter should be an Object where the top level, own, enumerable properties will be merged in as serializers. See [Fields](#fields) above.
```js
const logger = createLogger();
const childLogger = logger.create({ name: 'child_logger' });
logger.serializers; // { err: [Function] }
childLogger.serializers; // { err: [Function] }

logger.mergeSerializers({ req: requestSerializer });
logger.serializers; // { err: [Function], req: [Function] }
childLogger.serializers; // { err: [Function], req: [Function] }
```

#### addStream(stream)
Append an output stream onto the streams list for this logger and all child loggers recursively. The `stream` parameter must be a Node.js Writable or Duplex Stream instance. If the stream instance has an `init()` method, it will be called. See [Streams](#streams) above.
```js
const logger = createLogger();
const childLogger = logger.create({ name: 'child_logger' });
logger.streams; // [ JSONStream {} ]
childLogger.streams; // [ JSONStream {} ]

logger.addStream({ new OutputSream() });
logger.streams; // [ JSONStream, OutputStream ]
childLogger.streams; // [ JSONStream {}, OutputStream {} ]
```

Copyright and License
---------------------
Copyright: (c) 2017 - 2019 by Kris Walker (www.kixx.name)

Unless otherwise indicated, all source code is licensed under the MIT license. See MIT-LICENSE for details.

