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
      if (err) {
        throw new Error(err);
      } else {
        event.emit('dbInit');
        this.db = db;
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
   * Creates a new record in the collection set
   * @param {Object} body The object to insert
   * @param {String|Number|Boolean} [version] The model version to use
   * @returns {Object} promise
   */
  create (body, version = false) {
    return new Promise((resolve, reject) => {
      this.checkConn()
        .then(() => {
          const validationErrors = this.validate(body, version);
          if (validationErrors) {
            reject(validationErrors);
          } else {
            this.db.collection(this.collection)
              .insert(body, (err, res) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(res.ops);
                }
              });
          }
        });
    });
  }
}
