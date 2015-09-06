'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _events = require('events');

var _mongodb = require('mongodb');

var event = new _events.EventEmitter();

/**
 * @class mongo
 */

var _default = (function () {

  /**
   * Handles setup of connection
   * @param {Object|String} config The db config obejct or connection string
   * @property {String} config.host
   * @property {Number} config.port
   * @property {String} config.database
   * @property {String} config.username
   * @property {String} config.password
   */

  function _default(config) {
    var _this = this;

    _classCallCheck(this, _default);

    var connStr = undefined;
    this.db = false;
    if (typeof config === 'string') {
      // If full conn string is passed
      connStr = config;
    } else {
      // Build from object
      connStr = 'mongodb://' + config.username + ':' + config.password + '@' + config.host + ':' + config.port + '/' + config.database;
    }
    // Create connection
    _mongodb.MongoClient.connect(connStr, function (err, db) {
      /* istanbul ignore if */
      if (err) {
        throw new Error(err);
      } else {
        // Set instance db
        _this.db = db;
        // Emit when conn established
        event.emit('dbInit');
        return db;
      }
    });
  }

  /**
   * Ensures connection established or waits for emit
   * @returns {Object} promise
   */

  _createClass(_default, [{
    key: 'checkConn',
    value: function checkConn() {
      var _this2 = this;

      return new _bluebird2['default'](function (resolve) {
        /* istanbul ignore if */
        if (!_this2.db) {
          event.on('dbInit', function () {
            resolve();
          });
        } else {
          resolve();
        }
      });
    }

    /**
     * Executes mongo commands after ensuring established connection
     * @param {String} command The command to execute
     * @param {*} ...params Spread of args to command
     * @returns {Object} promise
     */
  }, {
    key: 'execute',
    value: function execute(command) {
      var _this3 = this;

      for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        params[_key - 1] = arguments[_key];
      }

      return new _bluebird2['default'](function (resolve, reject) {
        // Ensure (or wait for) connection
        _this3.checkConn().then(function () {
          // Execute
          try {
            var coll = _this3.db.collection(_this3.collection);
            if (command === 'find') {
              // Find needs `toArray`
              resolve(coll.find(params[0]).toArray());
            } else {
              // All other commands
              resolve(coll[command].apply(coll, params));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
    }
  }, {
    key: 'createCollection',
    value: function createCollection(options) {
      var _this4 = this;

      return new _bluebird2['default'](function (resolve) {
        // Ensure (or wait for) connection
        _this4.checkConn().then(function () {
          resolve(_this4.db.createCollection(_this4.collection, options));
        });
      });
    }

    /**
     * Creates a new record in the collection set
     * @param {Object} body The object to insert
     * @param {String|Number|Boolean} [version] The model version to use
     * @returns {Object} promise
     */
  }, {
    key: 'create',
    value: function create(body) {
      var _this5 = this;

      var version = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      return new _bluebird2['default'](function (resolve, reject) {
        var validationErrors = _this5.validate(body, version);
        if (validationErrors) {
          reject(validationErrors);
        } else {
          _this5.execute('insert', body).then(function (res) {
            resolve(res.ops);
          })['catch'](function (err) {
            reject(err);
          });
        }
      });
    }

    /**
     * Reads record(s) from the collection based on query
     * @param {Object} [query] The query to execute
     * @param {String|Number|Boolean} [version]
     * @returns {Object} promise
     */
  }, {
    key: 'read',
    value: function read() {
      var _this6 = this;

      var query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var version = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      return new _bluebird2['default'](function (resolve, reject) {
        _this6.execute('find', query).then(function (res) {
          var tmp = [];
          res.forEach(function (rec) {
            tmp.push(_this6.sanitize(rec, version));
          });
          resolve(tmp);
        })['catch'](function (err) {
          reject(err);
        });
      });
    }

    /**
    * Updates record(s) from the collection based on query and body
    * @param {Object} [query] The query to execute
    * @param {Object} body The record property(ies) to update
    * @param {String|Number|Boolean} [version]
    * @returns {Object} promise
    */
  }, {
    key: 'update',
    value: function update() {
      var query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _this7 = this;

      var body = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var version = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      return new _bluebird2['default'](function (resolve, reject) {
        var validationErrors = _this7.validate(body, version);
        if (validationErrors) {
          reject(validationErrors);
        } else {
          _this7.execute('update', query, { $set: body }).then(function (res) {
            resolve(res.result);
          })['catch'](function (err) {
            reject(err);
          });
        }
      });
    }

    /**
     * Deletes record(s) from the collection based on query
     * @param {Object} query The query to execute
     * @returns {Object} promise
     */
  }, {
    key: 'delete',
    value: function _delete(query) {
      var _this8 = this;

      return new _bluebird2['default'](function (resolve, reject) {
        _this8.execute('remove', query).then(function (res) {
          resolve(res.result);
        })['catch'](function (err) {
          reject(err);
        });
      });
    }

    /**
    * Extends adapter by adding new method
    * @memberof nedb
    * @param {String} name The name of the method
    * @param {Function} fn The method to add
    */
  }, {
    key: 'extend',
    value: function extend(name, fn) {
      this[name] = fn.bind(this);
    }
  }]);

  return _default;
})();

exports['default'] = _default;
module.exports = exports['default'];