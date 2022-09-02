Kixx Logger
===========
A logger for Node.js programs.

Inspired by [Bunyan](https://github.com/trentm/node-bunyan).

## Principles
- __No dependencies:__ A logger is a low level primitive component which systems depend on and should NOT complicate matters by having dependencies itself.
- __Provide rich and indexable information:__ Logs should be output in structured data formats which can be leveraged by other tools for analysis.
- __Flexibility without complexity:__ Use good defaults but provide opportunities for users to override nearly all functionality.

## Engines
__node__ >= 16.0.0 (tested on Node.js 16.14.0)

__npm__ >= 8.0.0 (published with npm 8.3.1)

## Examples
```js
const { Logger } = require('kixx-logger');

const logger = Logger.create({ name: 'RootApplication' });

logger.info('database connection established', { timeElapsed: 200 });
```

Output to [stdout](http://www.linfo.org/standard_output.html):

```
{"name":"RootApplication","hostname":"kixxauth-Mac-mini.local","pid":16643,"time":"2022-09-01T10:28:43.009Z","level":30,"msg":"database connection established","timeElapsed":200}
```

### Example of using log levels

```js
if (myEnvironment === 'prod') {
    logger.setLevel(Logger.Levels.WARN);
} else {
    logger.setLevel(Logger.Levels.DEBUG);
}

const start = Date.now();

initializeMyDatabase()
    .then(() => {
        const timeElapsed = Date.now() - start;
        logger.info('database connection established', { timeElapsed });
    })
    .catch((err) => {
        const timeElapsed = Date.now() - start;
        logger.error('database connection error', {
            timeElapsed,
            error: {
                name: err.name,
                message: err.message,
                code: err.code,
            },
        });
    });
```

In the example above we conditionally set the log level based on the environment we're running in. In "prod" we'll limit output to WARN and higher. Other environments will output logs emitted at DEBUG level and higher. See [Log Levels](#log-levels) for more information.

The output for that nested error log will look like this:

```
{"name":"RootApplication","hostname":"kixxauth-Mac-mini.local","pid":16643,"time":"2022-09-01T10:28:43.009Z","level":30,"msg":"database connection error","timeElapsed":200,"error":{"name":"DatabaseError","message":"connection failed","code":"ECONNFAILED"}}
```

### Example of using a child logger
```js
const { Logger } = require('kixx-logger');

class Database {
    constructor({ logger }) {
        this.logger = logger.createChild({ name: 'Database' });
    }

    init() {
        this.logger.info('initialized');
    }
}

const logger = Logger.create({ name: 'RootApplication' });
const db = new Database({ logger });

logger.setLevel(Logger.Levels.INFO);

db.init();
```

Notice in the example above we call setLevel() on the root logger *after* a child logger has been created in the Database constructor. The child logger will get the setLevel() change set on the root logger even after it has been created. See [Child Loggers](#child-loggers) for more information.

If the logger in the Database init() method will output to [stdout](http://www.linfo.org/standard_output.html). Notice the composite name field representing the child logger's relationship to the parent:

```
{"name":"RootApplication:Database","hostname":"kixxauth-Mac-mini.local","pid":16643,"time":"2022-09-01T11:05:47.834Z","level":30,"msg":"initialized"}
```

### Example of customizing default output fields
```js
const { Logger } = require('kixx-logger');

class Database {
    constructor({ logger }) {
        this.logger = logger.createChild({
            name: 'Database',
            defaultFields: {
                component: 'my-database'
            }
        });
    }

    init() {
        this.logger.info('initialized');
    }
}

const logger = Logger.create({
    name: 'RootApplication',
    defaultFields: {
        service: 'my-micro-service',
        component: 'server',
    }
});

const db = new Database({ logger });

logger.info('initializing the database');
db.init();
```
The example above will output 2 log lines; one from the RootApplication logger and one from the Database logger. Notice that the Database child logger overrides the "component" field using the `defaultFields` attribute.

```
{"name":"RootApplication","hostname":"kixxauth-Mac-mini.local","pid":1426,"service":"my-micro-service","component":"server","time":"2022-09-02T11:27:24.054Z","level":30,"msg":"initializing the database"}
{"name":"RootApplication:DataBase","hostname":"kixxauth-Mac-mini.local","pid":1426,"service":"my-micro-service","component":"my-database","time":"2022-09-02T11:27:24.454Z","level":30,"msg":"initialized"}
```

## API
```js
const { Logger, streams } = require('kixx-logger');

const logger = Logger.create({ name: 'MyAwesomeApplication' });

const customizedLogger = Logger.create({
    name: 'MyCustomLogger',
    level: Logger.Levels.INFO,
    // Set the makePretty flag on the default JsonStdout stream.
    stream: streams.JsonStdout.create({ makePretty: true }),
    defaultFields: {
        hostname: '---', // Redact the hostname
        component: 'my-server',
    },
    serializers: {
        error(val) {
            return `${val.name}:${val.code} ${val.message}`;
        }
    }
});

logger.trace('a trace level 10 log', { foo: 'bar' });
logger.debug('a debug level 20 log', { foo: 'bar' });
logger.info('an info race level 30 log', { foo: 'bar' });
logger.warn('a warn level 40 log', { foo: 'bar' });
logger.error('an error level 50 log', { foo: 'bar' });
logger.fatal('a fatal level 60 log', { foo: 'bar' });
```

### Logger
```js
const { Logger } = require('kixx-logger');

const logger = Logger.create({
    name,
    level,
    stream,
    defaultFields,
    serializers,
});
```

name | description | type | required | default
-----|-------------|------|----------|---------
name | The name for the logger instance which will be output as the `name` field | String | yes | |
level | The level for the logger; one of `Logger.Levels`. See [levels](#levels). | Number | optional | `Logger.Levels.DEBUG`
stream | The output stream for the logger instance | WriteableStream | optional | [JsonStdout](#jsonstdout)
defaultFields | Output values to include in every log output. See [Custom Fields](#custom-fields) | Object | optional | `{ name, hostname, pid }`
serializers | A map of serialization functions to known log output fields. See [Serializers](#serializers) | Object | optional | `{}`

__NOTE:__ Use `Logger.create()` instead of `new Logger()`. It's much safer.

### Levels
The default level is `Logger.Levels.DEBUG`.

name  | constant              | numerical value
------|-----------------------|----------------
trace | `Logger.Levels.TRACE` | 10
debug | `Logger.Levels.DEBUG` | 20
info  | `Logger.Levels.INFO`  | 30
warn  | `Logger.Levels.WARN`  | 40
error | `Logger.Levels.ERROR` | 50
fatal | `Logger.Levels.FATAL` | 60

```js
logger.trace(); // Will emit a log record when the logger.level is >= TRACE (10)
logger.debug(); // Will emit a log record when the logger.level is >= DEBUG (20)
logger.info(); // Will emit a log record when the logger.level is >= INFO (30)
logger.warn(); // Will emit a log record when the logger.level is >= WARN (40)
logger.error(); // Will emit a log record when the logger.level is >= ERROR (50)
logger.fatal(); // Will emit a log record when the logger.level is >= FATAL (60)
```

*[Child Loggers](#child-loggers) will inherit the level of the parent logger from which they are spawned.*

The current level of a logger can be changed at any point in the runtime using the `logger.setLevel()` method.

```js
const { Logger } = require('kixx-logger');
const logger = Logger.create({ name: 'MyLogger' });
logger.setLevel(Logger.Levels.INFO);
```

*Calling logger.setLevel() will also update the level of the entire [Child Logger](#child-loggers) sub-tree.*

### Child Loggers
Create a child logger:

```js
const { Logger } = require('kixx-logger');
const logger = Logger.create({ name: 'Application' });
const routerLogger = logger.createChild({ name: 'Router' });
const databaseLogger = logger.createChild({ name: 'Database' });

routerLogger.name; // "Application:Router"
databaseLogger.name; // "Application:Database"
```

Notice the compound logger name delineated by a ":".

The child Logger will inherit all the streams attached to the parent logger.

```js
const childLogger = logger.createChild({
    name,
    level,
    defaultFields,
    serializers,
});
```

name | description | type | required | default
-----|-------------|------|----------|---------
name | Will be combined with the parent logger name and output as the `name` field | String | yes | |
level | The level for the logger; one of `Logger.Levels`. See [levels](#levels). | Number | optional | Parent Logger level
defaultFields | Output values to include in every log output. See [Custom Fields](#custom-fields) | Object | optional | Parent Logger values
serializers | A map of serialization functions to known log output fields. | Object | optional | Parent Logger values

If a level is not provided, it will be inherited from the parent Logger. If `.setLevel()` is called on the parent logger it will update the log level on the entire child logger sub-tree down from that parent.

Default fields (`defaultFields`) and serializers (`serializers`) will override any custom fields or serializers present on the parent Logger.

### Fields
Each log method (`trace()`, `debug()`, `info()`, `warn()`, `error()`, `fatal()`) emits a log record. A log record is made up of fields, which may be nested.

There are default fields added to every log record:

- __name__ : The name String of the logger.
- __hostname__ : The string derived from `require('os').hostname()`.
- __pid__ : The `process.pid` value.

You can override any of these default values by setting them in your defaultFields parameter:

```js
const logger = Logger.create({
    name: 'root',
    defaultFields: {
        hostname: 'XXX', // Redact the hostname
        component: 'root',
    }
});

const childLogger = logger.createChild({
    name: 'memstore',
    defaultFields: {
        component: 'memstore-client',
    }
});
```

Child loggers inherit default fields from the parent. Default fields explicitly set on the child will override those on the parent.

## Serializers
Each log method (`trace()`, `debug()`, `info()`, `warn()`, `error()`, `fatal()`) emits a log record. A log record is then serialized to the chosen output stream, typically using the default JsonStdout stream piped to `process.stdout` (see [Streams](#streams) below). Using custom serializers enable you to modify the fields in the log record before it is output by a stream.

Serializer keys must match the names of the log record fields they are meant to serialize. A serializer must be a function which takes the field value as input and returns a new Object or primitive value.

Here is an example of creating a logger with a serializer added to serialize Node.js IncomingRequest instances:

```js
const http = require('http');
const { Logger } = require('kixx-logger');

function requestSerializer(req) {
    return {
        method: req.method,
        path: req.url.split('?')[0],
        query: req.url.split('?')[1] || ''
    };
}

const logger = Logger.create({
    name: 'request',
    serializers: { req: requestSerializer }
});

const server = http.createServer((req, res) => {
    logger.info('incoming request', { req });
});
```

### Streams
Streams are Node.js Writable Streams which take log records emitted by each log method (`trace()`, `debug()`, `info()`, `warn()`, `error()`, `fatal()`) and output a serialized version of it somewhere, usually to stdout. Using streams in this way provides flexibility for your runtime to decide where logs should go and how to get them there.

The default output stream is the JsonStdout stream provided in this library.

### JsonStdout
If no stream is specified when you create your logger, then the internal JsonStdout stream will be used as a default. This stream can operate in two modes:

- JSON formatted text to stdout
- Pretty printed text to stdout

Here is an example of customizing a typical Logger for pretty printing:

```js
const { Logger, streams } = require('kixx-logger');

let stream;

if (environment === 'dev') {
    stream = streams.JsonStdout.create({ makePretty: true });
}

// Leaving `stream` undefined will signal to the logger instance to use the JsonStdout stream in
// JSON output mode by default.

const logger = Logger.create({
    name: 'app',
    stream,
});
```

### Custom Streams

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

You can set a `level` property on your stream, which will filter it to only that level and higher. So, for a stream set `stream.level = Logger.Levels.ERROR` the stream will only receive log records for the ERROR and FATAL levels.

You add your stream to a logger by passing it in at construction time, or by adding it with the instance method `logger.addStream(stream)`. If your custom stream has an `init()` method, it will be called when the stream is added.

Here is an example of a very simple text output stream:
```js
const { EOL } = require('os');
const { Transform } = require('stream');
const { Logger } = require('kixx-logger');

class MyOutputStream extends Transform {
    constructor(options) {
        super({ objectMode: true });
    }

    init() {
        this.pipe(process.stdout);
    }

    _transform(record, encoding, callback) {
        const { time, level, name, message } = record;
        const levelString = Logger.levelToString(level);
        callback(`${timeString} - ${name} - ${level} - ${message}${EOL}`);
    }
}

// Using your stream at construction time means the default JsonStdout
// Stream will NOT be used:
const loggerA = Logger.create({
    name: 'app',
    stream: new MyOutputStream()
});

// Or you can use the default JsonStdout stream and add your custom output
// stream with an optional level.
const loggerB = Logger.create({ name: 'app' });

logger.addStream(new MyOutputStream(), Logger.Levels.ERROR);
```

Copyright and License
---------------------
Copyright: (c) 2017 - 2022 by Kris Walker <kris@kixx.name>

Unless otherwise indicated, all source code is licensed under the MIT license. See MIT-LICENSE for details.

