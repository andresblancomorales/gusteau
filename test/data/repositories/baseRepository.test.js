import BaseRepository from '../../../src/data/repositories/baseRepository';

const getFakeModel = saveFn => {
  class FakeModel {
    constructor(model) {
      this.model = model;
    }

    save(model) {
      return saveFn();
    }

    static findById(id) {

    }

    static updateOne(id, data, options) {

    }
  }

  return FakeModel;
};


describe('BaseRepository', () => {
  let repository;

  before(done => {
    repository = new BaseRepository();
    done();
  });

  it('should save the model and return the new object', async () => {
    let fakeSave = sinon.fake.returns(Promise.resolve({_id: '1234', model: 'fake'}));
    repository.Model = getFakeModel(fakeSave);

    let result = await repository.save({model: 'fake'});

    expect(result).to.deep.equal({_id: '1234', model: 'fake'});
  });

  it('should reject the promise if saving fails', done => {
    let fakeSave = sinon.fake.returns(Promise.reject({name: 'SaveFailed'}));
    repository.Model = getFakeModel(fakeSave);

    repository.save({model: 'fake'}).catch(error => {
      expect(error).to.deep.equal({name: 'SaveFailed'});
      done();
    });
  });

  it('should get a model by id', async () => {
    repository.Model = getFakeModel();

    sinon.stub(repository.Model, "findById")
      .withArgs('1234')
      .returns(Promise.resolve({_id: '1234'}));

    let result = await repository.get('1234');

    expect(result).to.deep.equal({_id: '1234'});
  });

  it('should reject the promise if getting a model fails', done => {
    repository.Model = getFakeModel();

    sinon.stub(repository.Model, "findById")
      .withArgs('1234')
      .returns(Promise.reject({name: 'GetFailed'}));

    repository.get('1234').catch(error => {
      expect(error).to.deep.equal({name: 'GetFailed'});
      done();
    });
  });

  it('should update a model by id and return the updated model', async () => {
    repository.Model = getFakeModel();

    sinon.stub(repository.Model, "updateOne")
      .withArgs({_id: '1234'}, {name: 'Andres'}, {runValidators: true})
      .returns(Promise.resolve({_id: '1234', name: 'Andres'}));

    let result = await repository.updateById('1234', {name: 'Andres'});

    expect(result).to.deep.equal({_id: '1234', name: 'Andres'});
  });

  it('should reject the promise if updating a model fails', done => {
    repository.Model = getFakeModel();

    sinon.stub(repository.Model, "updateOne")
      .withArgs({_id: '1234'}, {name: 'Andres'}, {runValidators: true})
      .returns(Promise.reject({name: 'UpdateFailed'}));

    repository.updateById('1234', {name: 'Andres'}).catch(error => {
      expect(error).to.deep.equal({name: 'UpdateFailed'});
      done();
    });
  });

});