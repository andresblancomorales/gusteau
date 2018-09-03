import RecipeRepository from '../../src/data/repositories/recipeRepository';
import RecipeManagement from '../../src/logic/recipeManagement';

describe('RecipeManagement', () => {
  let recipeManagement;

  before(done => {
    let recipeRepository = new RecipeRepository();
    sinon.stub(recipeRepository, 'getRecipes')
      .withArgs(undefined, 10)
      .returns([{_id: '001', name: 'Cool recipe'}, {_id: '002', name: 'Nice recipe'}])
      .withArgs('001', 10)
      .returns([{_id: '002', name: 'Nice recipe'}]);

    recipeManagement = new RecipeManagement(recipeRepository);

    done();
  });

  it('should get the latest recipes', async () => {
    let recipes = recipeManagement.getRecipes();

    expect(recipes).to.deep.equal([{_id: '001', name: 'Cool recipe'}, {_id: '002', name: 'Nice recipe'}]);
  });

  it('should get the latest recipes using an offset', async () => {
    let recipes = recipeManagement.getRecipes('001');

    expect(recipes).to.deep.equal([{_id: '002', name: 'Nice recipe'}]);
  });

});