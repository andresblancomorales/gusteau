import SessionRepository from '../../../src/data/repositories/sessionRepository';
import {Schema} from "mongoose";

describe('SessionRepository', () => {
  let repository;

  before(done => {
    repository = new SessionRepository();
    done();
  });

  it('should have the correct Model', done => {
    let model = repository.Model;

    expect(model.modelName).to.equal('Session');
    expect(model.schema).to.equal(repository.Schema);

    done();
  });

  it('should have the correct schema properties', done => {
    let schema = repository.Schema;

    expect(schema.options.collection).to.equal('sessions');
    expect(schema.obj).to.include.all.keys('userId', 'startDate', 'token', 'client', 'expirationDate', 'state');
    expect(schema.obj.userId).to.deep.equal({type: Schema.Types.ObjectId, required: true});
    expect(schema.obj.startDate).to.deep.equal({type: Number, required: true});
    expect(schema.obj.token).to.deep.equal({type: String, required: true});
    expect(schema.obj.client).to.deep.equal({type: Schema.Types.ObjectId, required: true});
    expect(schema.obj.expirationDate).to.deep.equal({type: Number, required: true});
    expect(schema.obj.state).to.deep.equal({type: String, required: true});

    done();
  });
});
