import CategoryRepository from '../../../src/data/repositories/categoryRepository';

describe('CategoryRepository', () => {

  let repository;

  before(done => {
    repository = new CategoryRepository();
    done();
  });

  it('should have the correct model', done => {
    let model = repository.Model;

    expect(model.modelName).to.equal('Category');
    expect(model.schema).to.equal(repository.Schema);

    done();
  });

  it('should have the correct schema properties', done => {
    let schema = repository.Schema;

    expect(schema.options.collection).to.equal('categories');
    expect(schema.obj).to.include.all.keys('name');
    expect(schema.obj.name).to.deep.equal({type: String, required: true});
    expect(schema.obj.description).to.deep.equal({type: String, required: true});

    done();
  });

  it('should get all categories', async () => {
    sinon.stub(repository.Model, 'find')
      .returns(Promise.resolve([{_id: '001', name: 'pasta', description: 'Pasta'}, {_id: '002', name: 'pizza', description: 'Pizza'}]));

    let result = await repository.getAll();

    repository.Model.find.restore();

    expect(result).to.deep.equal([{_id: '001', name: 'pasta', description: 'Pasta'}, {_id: '002', name: 'pizza', description: 'Pizza'}]);
  });
});
