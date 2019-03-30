Kixx Logger
===========
A logger for Node.js

## Example
```js
const { createLogger } = require('kixx-logger');

const logger = createLogger();

// TRACE
logger.trace('trace message');

// stdout:
// {"time":"2030-03-27T13:07:16.221Z","level":10,"msg":"trace message","name":"root","hostname":"kixxauths-Mac-mini.local","pid":38010}

// with dev stream, stdout:
// 09:07:16.221 TRACE root "trace message"

// DEBUG
logger.debug('debug message with custom property', {elapsed: 10});

// stdout:
// {"time":"2030-03-27T13:07:16.227Z","level":20,"msg":"debug message with custom property","name":"root","hostname":"kixxauths-Mac-mini.local","pid":38010,"elapsed":10}

// with dev stream, stdout:
// 09:07:16.227 DEBUG root "debug message with custom property" { elapsed: 10 }

// INFO
logger.info('log message with custom object', {req: {
    url: '/foo/index.html',
    method: 'GET'
}});

// stdout:
// {"time":"2030-03-27T13:07:16.232Z","level":30,"msg":"log message with custom object","name":"root","hostname":"kixxauths-Mac-mini.local","pid":38010,"req":{"url":"/foo/index.html","method":"GET"}}

// with dev stream, stdout:
// 09:07:16.232 INFO root "log message with custom object" { req: { url: '/foo/index.html', method: 'GET' } }

// WARN
logger.warn('warning message');

// stdout:
// {"time":"2030-03-27T13:07:16.241Z","level":40,"msg":"warning message","name":"root","hostname":"kixxauths-Mac-mini.local","pid":38010}

// with dev stream, stdout:
// 09:07:16.241 WARN root "warning message"

// ERROR
logger.error('error message with Error', { err: new Error('Something bad happened') });

// stdout:
// {"time":"2030-03-27T13:07:16.252Z","level":50,"msg":"error message with Error","name":"root","hostname":"kixxauths-Mac-mini.local","pid":38010,"err":{"name":"Error","message":"Something bad happened","stack":"Error: Something bad happened\n    at repl:1:11\n    at ContextifyScript.Script.runInThisContext (vm.js:50:33)\n    at REPLServer.defaultEval (repl.js:240:29)\n    at bound (domain.js:301:14)\n    at REPLServer.runBound [as eval] (domain.js:314:12)\n    at REPLServer.onLine (repl.js:468:10)\n    at emitOne (events.js:121:20)\n    at REPLServer.emit (events.js:211:7)\n    at REPLServer.Interface._onLine (readline.js:280:10)\n    at REPLServer.Interface._line (readline.js:629:8)"}}

// with dev stream, stdout:
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

// FATAL
logger.fatal('crashing');
// stdout:
// {"time":"2030-03-27T13:07:16.261Z","level":60,"msg":"crashing","name":"root","hostname":"kixxauths-Mac-mini.local","pid":38010}

// with dev stream, stdout:
// 09:07:16.261 FATAL root "crashing"
```

Copyright and License
---------------------
Copyright: (c) 2017 - 2019 by Kris Walker (www.kixx.name)

Unless otherwise indicated, all source code is licensed under the MIT license. See MIT-LICENSE for details.

