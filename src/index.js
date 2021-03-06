import Promise from 'bluebird';
import { EventEmitter } from 'events';
import { MongoClient } from 'mongodb';

const event = new EventEmitter();

/**
 * @class mongo
 */
export default class {

  /**
   * Handles setup of connection
   * @param {Object|String} config The db config obejct or connection string
   * @property {String} config.host
   * @property {Number} config.port
   * @property {String} config.database
   * @property {String} config.username
   * @property {String} config.password
   */
  constructor (config) {
    let connStr;
    this.db = false;
    if (typeof config === 'string') {
      // If full conn string is passed
      connStr = config;
    } else {
      // Build from object
      connStr = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    }
    // Create connection
    MongoClient.connect(connStr, (err, db) => {
      /* istanbul ignore if */
      if (err) {
        throw new Error(err);
      } else {
        // Set instance db
        this.db = db;
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
  checkConn () {
    return new Promise((resolve) => {
      /* istanbul ignore if */
      if (!this.db) {
        event.on('dbInit', () => {
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
  execute (command, ...params) {
    return new Promise((resolve, reject) => {
      // Ensure (or wait for) connection
      this.checkConn()
        .then(() => {
          // Execute
          try {
            const coll = this.db.collection(this.collection);
            if (command === 'find') {
              // Find needs `toArray`
              resolve(coll.find(params[0]).toArray());
            } else {
              // All other commands
              resolve(coll[command](...params));
            }
          } catch (e) {
            reject(e);
          }
        });
    });
  }

  createCollection (options) {
    return new Promise((resolve) => {
      // Ensure (or wait for) connection
      this.checkConn()
        .then(() => {
          resolve(this.db.createCollection(this.collection, options));
        });
    });
  }

  /**
   * Creates a new record in the collection set
   * @param {Object} body The object to insert
   * @param {String|Number|Boolean} [version] The model version to use
   * @returns {Object} promise
   */
  create (body, version = false) {
    return new Promise((resolve, reject) => {
      const validationErrors = this.validate(body, version);
      if (validationErrors) {
        reject(validationErrors);
      } else {
        this.execute('insert', body)
          .then((res) => {
            resolve(res.ops);
          })
          .catch((err) => {
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
  read (query = {}, version = false) {
    return new Promise((resolve, reject) => {
      this.execute('find', query)
        .then((res) => {
          let tmp = [];
          res.forEach((rec) => {
            tmp.push(this.sanitize(rec, version));
          });
          resolve(tmp);
        })
        .catch((err) => {
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
  update (query = {}, body = {}, version = false) {
    return new Promise((resolve, reject) => {
      const validationErrors = this.validate(body, version);
      if (validationErrors) {
        reject(validationErrors);
      } else {
        this.execute('update', query, { $set: body })
          .then((res) => {
            resolve(res.result);
          })
          .catch((err) => {
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
  delete (query) {
    return new Promise((resolve, reject) => {
      this.execute('remove', query)
        .then((res) => {
          resolve(res.result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
  * Extends adapter by adding new method
  * @param {String} name The name of the method
  * @param {Function} fn The method to add
  */
  extend (name, fn) {
    this[name] = fn.bind(this);
  }
}
