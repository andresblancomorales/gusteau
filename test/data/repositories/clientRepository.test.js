import ClientRepository from '../../../src/data/repositories/clientRepository';
import {ClientNotFoundException} from "../../../src/utils/exceptions";

describe('ClientRepository', () => {
  let repository;

  before(done => {
    repository = new ClientRepository();
    done();
  });

  it('should have the correct Model', done => {
    let model = repository.Model;

    expect(model.modelName).to.equal('Client');
    expect(model.schema).to.equal(repository.Schema);
    expect(typeof model.getByName).to.equal('function');

    done();
  });

  it('should have the correct schema properties', done => {
    let schema = repository.Schema;

    expect(schema.options.collection).to.equal('clients');
    expect(schema.obj).to.include.all.keys('name', 'redirectUrl', 'tokenTtl');
    expect(schema.obj.name).to.deep.equal({type: String, required: true});
    expect(schema.obj.redirectUrl).to.deep.equal({type: String, required: true});
    expect(schema.obj.tokenTtl).to.deep.equal({type: Number, required: true});

    done();
  });

  it('should get a client by its name', async () => {
    sinon.stub(repository.Model, 'findOne')
      .withArgs({name: new RegExp('gusteau', 'i')})
      .returns(Promise.resolve({
        name: 'gusteau',
        redirectUrl: 'http://www.gusteau.com',
        tokenTtl: 86400
      }));

    let result = await repository.getByName('gusteau');

    repository.Model.findOne.restore();

    expect(result).to.deep.equal({
      name: 'gusteau',
      redirectUrl: 'http://www.gusteau.com',
      tokenTtl: 86400
    });
  });

  it('should try to get a client by its name and throw a ClientNotFoundException if the client is not found', done => {
    sinon.stub(repository.Model, 'findOne')
      .withArgs({name: new RegExp('notExistent', 'i')})
      .returns(Promise.resolve(null));

    repository.getByName('notExistent')
      .catch(error => {
        expect(error.name).to.equal(ClientNotFoundException.Name);
        expect(error.client).to.equal('notExistent');
        repository.Model.findOne.restore();
        done();
      });
  });

});
