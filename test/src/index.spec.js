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
};

const testRecord = {
  fname: 'John',
  lname: 'Smith',
  email: 'jsmith@gmail.com'
};

const testMongo = new mongo(config);

// Mock validation method, this is automatically done by the model
testMongo.validate = (body) => {
  // Test validation failure by passing `failValidate: true`
  if (body.failValidate) {
    return { error: true };
  }
  // Mock passing validation, return null
  return null;
};

// Mock sanitize method, this is automatically done by the model
testMongo.sanitize = (body) => {
  return body;
};

// Set collection
testMongo.collection = 'foo';

describe('mongo', () => {
  describe('constructor', () => {
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
    });
  });

  describe('create', () => {
    it('responds with an error if validation fails', (done) => {
      testMongo.create({
        failValidate: true
      })
      .catch((err) => {
        expect(err.error).to.be.true;
        done();
      });
    });
    it('responds with an error if the body is invalid', (done) => {
      testMongo.create('foo=')
        .catch((err) => {
          expect(err).to.be.instanceof(TypeError);
          done();
        });
    });
    it('creates a record if proper object passed', (done) => {
      testMongo.create(testRecord)
      .then((res) => {
        expect(res[0]).to.be.an.object;
        expect(res[0].email).to.equal(testRecord.email);
        done();
      });
    });
  });
});
