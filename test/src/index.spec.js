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
  before((done) => {
    testMongo.createCollection({})
      .then(() => done())
      .catch((err) => done(err));
  });

  describe('constructor', () => {
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

  describe('execute', () => {
    it('executes a method with args supplied', (done) => {
      testMongo.execute('stats')
        .then((res) => {
          expect(res).to.be.an.object;
          done();
        });
    });
    it('fails if the command is executed incorrectly', (done) => {
      testMongo.execute('insert', '/my-foot/')
        .catch((err) => {
          expect(err).to.be.instanceof(TypeError);
          done();
        });
    });
    it('fails if the command is not recognized', (done) => {
      testMongo.execute('farts')
        .catch((err) => {
          expect(err).to.be.instanceof(TypeError);
          done();
        });
    });
  });

  describe('createCollection', () => {
    it('creates a new collection based on the objects collection prop (name)', (done) => {
      testMongo.createCollection()
        .then((res) => {
          expect(res).to.be.an.object;
          done();
        });
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
    it('responds with an error when improper data inserted', (done) => {
      testMongo.create('test')
        .catch((err) => {
          expect(err).to.be.instanceof(TypeError);
          done();
        });
    });
    it('creates a record if proper object passed', (done) => {
      testMongo.create(testRecord, 1)
      .then((res) => {
        expect(res[0]).to.be.an.object;
        expect(res[0].email).to.equal(testRecord.email);
        done();
      });
    });
  });

  describe('read', () => {
    it('responds with an error if query is invalid', (done) => {
      testMongo.read({ fname: { '$in': false } }, 1)
        .catch((err) => {
          expect(err).to.be.object;
          done();
        });
    });
    it('returns all record if no query supplied', (done) => {
      testMongo.read()
        .then((res) => {
          expect(res).to.be.an.array;
          done();
        });
    });
    it('returns the matched data on valid query', (done) => {
      testMongo.read({ fname: 'John' })
        .then((res) => {
          expect(res[0].fname).to.equal('John');
          done();
        });
    });
  });

  describe('update', () => {
    it('responds with an error if query is invalid', (done) => {
      testMongo.update({ fname: { '$in': false } }, 1)
        .catch((err) => {
          expect(err).to.be.an.object;
          done();
        });
    });
    it('responds with an error if validation fails', (done) => {
      testMongo.update({ fname: 'John' }, { failValidate: true })
        .catch((err) => {
          expect(err.error).to.be.true;
          done();
        });
    });
    it('updates the record when valid query and body are passed', (done) => {
      testMongo.update({ fname: 'John' }, { fname: 'Bob' })
        .then((res) => {
          expect(res.ok).to.equal(1);
          done();
        });
    });
  });

  describe('delete', () => {
    it('responds with an error if query is invalid', (done) => {
      testMongo.delete({ fname: { '$in': false } })
        .catch((err) => {
          expect(err).to.be.an.object;
          done();
        });
    });
    it('deletes the record(s) when valid query is passed', (done) => {
      testMongo.delete({ fname: 'John' })
        .then((res) => {
          expect(res.ok).to.equal(1);
          done();
        });
    });
  });

  describe('extend', () => {
    it('extends the object to allow for custom method', () => {
      // Extend
      testMongo.extend('myTestFn', () => {
        return 'foo';
      });
      // Test
      expect(testMongo.myTestFn()).to.equal('foo');
    });
  });
});
