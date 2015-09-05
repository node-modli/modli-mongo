import Promise from 'bluebird';
import { MongoClient } from 'mongodb';

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
        this.db = db;
        return db;
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
  }
}
