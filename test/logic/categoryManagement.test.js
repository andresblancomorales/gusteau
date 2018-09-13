import CategoryRepository from '../../src/data/repositories/categoryRepository';
import CategoryManagement from '../../src/logic/categoryManagement';

describe('CategoryManagement', () => {
  let categoryManagement;

  before(done => {
    let categoryRepository = new CategoryRepository();
    sinon.stub(categoryRepository, 'getAll')
      .returns([{_id: '001', name: 'pasta'}, {_id: '002', name: 'pizza'}]);

    categoryManagement = new CategoryManagement(categoryRepository);

    done();
  });


  it('should get all the categories', async () => {
    let categories = await categoryManagement.getCategories();

    expect(categories).to.deep.equal([{_id: '001', name: 'pasta'}, {_id: '002', name: 'pizza'}]);
  });
});