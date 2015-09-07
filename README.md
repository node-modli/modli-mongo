[![wercker status](https://app.wercker.com/status/965720bdeb6427fcccf0323da755240b/s/master "wercker status")](https://app.wercker.com/project/bykey/965720bdeb6427fcccf0323da755240b)
[![Code Climate](https://codeclimate.com/github/node-modli/modli-mongo/badges/gpa.svg)](https://codeclimate.com/github/node-modli/modli-mongo)
[![Test Coverage](https://codeclimate.com/github/node-modli/modli-mongo/badges/coverage.svg)](https://codeclimate.com/github/node-modli/modli-mongo/coverage)

# Modli - Mongo Adapter

This module provides adapter for the [Mongo](https://www.mongodb.com)
datasource for integration with [Modli](https://github.com/node-modli).

## Installation

```
npm install modli-mongo --save
```

## Config and Usage

When defining a property which will utilize the adapter it is required that a
`collection` be supplied:

```javascript
import { model, adapter, Joi, use } from 'modli';
import mongo from 'modli-mongo';

model.add({
  name: 'foo',
  version: 1,
  collection: 'fooCollection'
  schema: {
    id: Joi.number().integer(),
    fname: Joi.string().min(3).max(30),
    lname: Joi.string().min(3).max(30),
    email: Joi.string().email().min(3).max(254).required()
  }
});
```

Then add the adapter as per usual with the following config object structure:

```javascript
adapter.add({
  name: 'mongoFoo',
  source: mongo
  config: {
    host: {HOST_IP},
    port: {HOST_PORT},
    username: {USERNAME},
    password: {PASSWORD},
    database: {DATABASE}
  }
});
```

You can then use the adapter with a model via:

```javascript
// Use(MODEL, ADAPTER)
const mongoTest = use('foo', 'mongoFoo');
```

## Methods

The following methods exist natively on the Mongo adapter:

### `execute`

Allows for executing methods directly on the collection:

```javascript
mongoTest.execute('insert', { /*...record...*/ })
  .then(/*...*/)
  .catch(/*...*/);
```

### `checkConn`

Ensures (or waits for) established connection:

```javascript
mongoTest.checkConn()
  .then(/*...*/);
```

*Note: the `checkConn` method is already utilized by all other methods
and only needs to be added in a case where you're extending
on or using a method of the `db` object directly.*

### `createCollection`

Creates the collection based on the model's `collection` name:

```javascript
mongoTest.createCollection()
  .then(/*...*/)
  .catch(/*...*/);
```

### `create`

Creates a new record based on object passed:

```javascript
mongoTest.create({
    fname: 'John',
    lname: 'Smith',
    email: 'jsmith@gmail.com'
  })
  .then(/*...*/)
  .catch(/*...*/);
```

### `read`

Returns records matching a query object (or all if no query specified):

```javascript
mongoTest.read({ fname: 'John' })
  .then(/*...*/)
  .catch(/*...*/);
```

### `update`

Updates record(s) based on query and body:

```javascript
mongoTest.update({ fname: 'John' }, {
    fname: 'Bob',
    email: 'bsmith@gmail.com'
  })
  .then(/*...*/)
  .catch(/*...*/);
```

### `delete`

Deletes record(s) based on query:

```javascript
mongoTest.delete({ fname: 'John' })
  .then(/*...*/)
  .catch(/*...*/);
```

### `extend`

Extends the adapter to allow for custom methods:

```javascript
mongoTest.extend('myMethod', () => {
  /*...*/
});
```

## Development

The Mongo adapter requires the following environment variables to be set for
running the tests. These should be associated with the Mongo instance running
locally.

```
MODLI_MONGO_HOST,
MODLI_MONGO_PORT,
MODLI_MONGO_USERNAME,
MODLI_MONGO_PASSWORD,
MODLI_MONGO_DATABASE
```

This repository includes a base container config for running locally which is
located in the [/docker](/docker) directory.

## Makefile and Scripts

A `Makefile` is included for managing build and install tasks. The commands are
then referenced in the `package.json` `scripts` if that is the preferred
task method:

* `all` (default) will run all build tasks
* `start` will run the main script
* `clean` will remove the `/node_modules` directories
* `build` will transpile ES2015 code in `/src` to `/build`
* `test` will run all spec files in `/test/src`
* `test-cover` will run code coverage on all tests
* `lint` will lint all files in `/src`

## Testing

Running `make test` will run the full test suite. Since adapters require a data
source if one is not configured the tests will fail. To counter this tests are
able to be broken up.

**Test Inidividual File**

An individual spec can be run by specifying the `FILE`. This is convenient when
working on an individual adapter.

```
make test FILE=some.spec.js
```

The `FILE` is relative to the `test/src/` directory.

**Deploys**

For deploying releases, the `deploy TAG={VERSION}` can be used where `VERSION` can be:

```
<newversion> | major | minor | patch | premajor
```

Both `make {COMMAND}` and `npm run {COMMAND}` work for any of the above commands.

## License

Modli-Mongo is licensed under the MIT license. Please see `LICENSE.txt` for full details.

## Credits

Modli-Mongo was designed and created at [TechnologyAdvice](http://www.technologyadvice.com).