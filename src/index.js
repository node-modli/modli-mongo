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

}