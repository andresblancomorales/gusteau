import RecipeRepository from '../../src/data/repositories/recipeRepository';
import RecipeManagement from '../../src/logic/recipeManagement';
import {RecipeExistsException} from "../../src/utils/exceptions";

describe('RecipeManagement', () => {
  let recipeManagement;

  before(done => {
    let recipeRepository = new RecipeRepository();
    sinon.stub(recipeRepository, 'getRecipes')
      .withArgs(undefined, 10)
      .returns(Promise.resolve([{_id: '001', name: 'Cool recipe'}, {_id: '002', name: 'Nice recipe'}]))
      .withArgs('001', 10)
      .returns(Promise.resolve([{_id: '002', name: 'Nice recipe'}]));
    sinon.stub(recipeRepository, 'exists')
      .withArgs('Rice n Beans')
      .returns(Promise.resolve(false))
      .withArgs('Duplicate Recipe')
      .returns(Promise.resolve(true));
    sinon.stub(recipeRepository, 'save')
      .withArgs({name: 'Rice n Beans', user: '001', state: 'Active'})
      .returns(Promise.resolve({_id: '007', name: 'Rice n Beans', user: '001', state: 'Active'}));

    recipeManagement = new RecipeManagement(recipeRepository);

    done();
  });

  it('should get the latest recipes', async () => {
    let recipes = await recipeManagement.getRecipes();

    expect(recipes).to.deep.equal([{_id: '001', name: 'Cool recipe'}, {_id: '002', name: 'Nice recipe'}]);
  });

  it('should get the latest recipes using an offset', async () => {
    let recipes = await recipeManagement.getRecipes('001');

    expect(recipes).to.deep.equal([{_id: '002', name: 'Nice recipe'}]);
  });

  it('should create a recipe', async () => {
    let newRecipe = await recipeManagement.createRecipe(
      {name: 'Rice n Beans'},
      {_id: '001'}
    );

    expect(newRecipe).to.deep.equal({_id: '007', name: 'Rice n Beans', user: '001', state: 'Active'});
  });

  it('should try to create a duplicate recipe and throw a RecipeExistsException', done => {
    recipeManagement.createRecipe(
      {name: 'Duplicate Recipe'},
      {_id: '001'}
    ).catch(error => {
      expect(error.name).to.equal(RecipeExistsException.Name);
      expect(error.recipeName).to.equal('Duplicate Recipe');
      done();
    });
  });

});