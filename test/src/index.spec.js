/* eslint no-unused-expressions: 0 */
/* global expect, request, describe, it, before, after */
import '../setup';
import mongo from '../../src/index';

const config = {
  host: process.env.MODLI_MONGO_HOST,
  port: process.env.MODLI_MONGO_PORT,
  database: process.env.MODLI_MONGO_DATABASE,
  username: process.env.MODLI_MONGO_USERNAME,
  password: process.env.MODLI_MONGO_PASSWORD
}

const testMongo = new mongo(config);

describe('mongo', () => {
  describe('constructor', (done) => {
    it('fails when an invalid config is passed', (done) => {
      expect(() => new mongo('')).to.throw();
      done();
    });
    it('connects to the instance when valid config is passed', (done) => {
      expect(() => new mongo(config)).to.not.throw();
      done();
    });
    it('connects when a raw conn string is passed', (done) => {
      const connStr = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
      expect(() => new mongo(connStr)).to.not.throw();
      done();
    })
  });
});