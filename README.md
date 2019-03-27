Kixx Logger
===========
A logger for Node.js

## Example
```js
const { createLogger } = require('kixx-logger');

const logger = createLogger();

logger.trace('trace message');
// stdout:
// {"time":"2030-03-27T13:07:16.221Z","level":10,"msg":"trace message","name":"root","hostname":"kixxauths-Mac-mini.local","pid":38010}

logger.debug('debug message with custom property', {elapsed: 10});
// stdout:
// {"time":"2030-03-27T13:07:16.227Z","level":20,"msg":"debug message with custom property","name":"root","hostname":"kixxauths-Mac-mini.local","pid":38010,"elapsed":10}

logger.info('log message with custom object', {req: {
    url: '/foo/index.html',
    method: 'GET'
}});
// stdout:
// {"time":"2030-03-27T13:07:16.232Z","level":30,"msg":"log message with custom object","name":"root","hostname":"kixxauths-Mac-mini.local","pid":38010,"req":{"url":"/foo/index.html","method":"GET"}}

logger.warn('warning message');

logger.error('error message with Error', { err: new Error('Something bad happened') });

logger.fatal('crashing');
```

Copyright and License
---------------------
Copyright: (c) 2017 - 2019 by Kris Walker (www.kixx.name)

Unless otherwise indicated, all source code is licensed under the MIT license. See MIT-LICENSE for details.

