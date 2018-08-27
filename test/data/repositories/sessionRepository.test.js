import SessionRepository from '../../../src/data/repositories/sessionRepository';
import {Schema} from "mongoose";
import {ClientNotFoundException} from "../../../src/utils/exceptions";

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

  it('should check if a session is active and return true if it is', async () => {
    sinon.stub(repository.Model, 'count')
      .withArgs({
        userId: '1234',
        expirationDate: {$gt: 1000},
        token: '70k3n',
        state: 'Valid'
      })
      .returns(Promise.resolve(1));

    let result = await repository.isSessionActive('1234', '70k3n', 1000);

    repository.Model.count.restore();
    expect(result).to.be.true;
  });

  it('should check if a session is active and return false if it isnt', async () => {
    sinon.stub(repository.Model, 'count')
      .withArgs({
        userId: '1234',
        expirationDate: {$gt: 1000},
        token: '70k3n',
        state: 'Valid'
      })
      .returns(Promise.resolve(0));

    let result = await repository.isSessionActive('1234', '70k3n', 1000);

    repository.Model.count.restore();
    expect(result).to.be.false;
  });

  it('should revoke an active token and return true if successful', async () => {
    sinon.stub(repository.Model, 'updateOne')
      .withArgs({
        userId: '1234',
        expirationDate: {$gt: 1000},
        token: '70k3n',
        state: 'Valid'
      }, {
        state: 'Revoked'
      })
      .returns(Promise.resolve({nModified: 1}));

    let result = await repository.revokeActiveToken('1234', '70k3n', 1000);

    repository.Model.updateOne.restore();
    expect(result).to.be.true;
  });

  it('should try to revoke an active token and return false if it failed', async () => {
    sinon.stub(repository.Model, 'updateOne')
      .withArgs({
        userId: '1234',
        expirationDate: {$gt: 1000},
        token: '70k3n',
        state: 'Valid'
      }, {
        state: 'Revoked'
      })
      .returns(Promise.resolve({nModified: 0}));

    let result = await repository.revokeActiveToken('1234', '70k3n', 1000);

    repository.Model.updateOne.restore();
    expect(result).to.be.false;
  })

});
