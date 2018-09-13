import RecipeRepository from '../../../src/data/repositories/recipeRepository';
import {Schema} from "mongoose";

describe('RecipeRepository', () => {

  let repository;

  before(done => {
    repository = new RecipeRepository();
    done();
  });

  it('should have the correct model', done => {
    let model = repository.Model;

    expect(model.modelName).to.equal('Recipe');
    expect(model.schema).to.equal(repository.Schema);
    expect(typeof model.getRecipes).to.equal('function');
    expect(typeof model.exists).to.equal('function');

    done();
  });

  it('should have the correct schema properties', done => {
    let schema = repository.Schema;

    expect(schema.options.collection).to.equal('recipes');
    expect(schema.obj).to.include.all.keys('name', 'category', 'user', 'pictureUrl', 'ingredients', 'preparation');
    expect(schema.obj.name).to.deep.equal({type: String, required: true});
    expect(schema.obj.category).to.deep.equal({type: Schema.Types.ObjectId, required: true});
    expect(schema.obj.user).to.deep.equal({type: Schema.Types.ObjectId, required: true, ref: 'User'});
    expect(schema.obj.pictureUrl).to.deep.equal({type: String, required: false});
    expect(schema.obj.state).to.deep.equal({type: String, required: true});
    expect(schema.obj.ingredients.type).to.deep.equal([{
      name: {type: String, required: true},
      amount: {type: String, required: true}
    }]);
    expect(schema.obj.ingredients.required).to.be.true;
    expect(schema.obj.ingredients.validate.validator([])).to.be.false;

    let lotsOfIngredientes = [];
    for(let i = 0; i < 15; i++) {
      lotsOfIngredientes.push({name: 'Rice', amount: '1 tsp'});
    }
    expect(schema.obj.ingredients.validate.validator(lotsOfIngredientes)).to.be.false;
    expect(schema.obj.ingredients.validate.validator([{name: 'Rice', amount: '1 tsp'}])).to.be.true;

    expect(schema.obj.preparation.type).to.deep.equal([String]);
    expect(schema.obj.preparation.required).to.be.true;
    expect(schema.obj.preparation.validate.validator([])).to.be.false;
    expect(schema.obj.ingredients.validate.validator(['Mix everything and cook'])).to.be.true;

    done();
  });

  it('should get all recipes sorted descendingly and limiting to 10 results', async () => {
    sinon.stub(repository.Model, "find")
      .returns({
        limit: sinon.stub()
          .withArgs(10)
          .returns({
            populate: sinon.stub()
              .withArgs('user')
              .returns({
                sort: sinon.stub()
                  .withArgs({_id: -1})
                  .returns(Promise.resolve([{_id: '001', name: 'Cool recipe'}, {_id: '002', name: 'Nice recipe'}]))
              })
          })
      });

    let result = await repository.getRecipes();

    repository.Model.find.restore();

    expect(result).to.deep.equal([{_id: '001', name: 'Cool recipe'}, {_id: '002', name: 'Nice recipe'}]);
  });

  it('should get all recipes sorted descendingly and limiting to 10 results using an offset', async () => {
    sinon.stub(repository.Model, "find")
      .withArgs({_id: {$lt: '001'}})
      .returns({
        limit: sinon.stub()
          .withArgs(5)
          .returns({
            populate: sinon.stub()
              .withArgs('user')
              .returns({
                sort: sinon.stub()
                  .withArgs({_id: -1})
                  .returns(Promise.resolve([{_id: '002', name: 'Nice recipe'}]))
              })
          })
      });

    let result = await repository.getRecipes('001', 5);

    repository.Model.find.restore();

    expect(result).to.deep.equal([{_id: '002', name: 'Nice recipe'}]);
  });

  it('should check if a recipe exists and return true if it does', async () => {
    sinon.stub(repository.Model, "count")
      .withArgs({name: new RegExp('Rice n Beans', 'i')})
      .returns(Promise.resolve(1));

    let result = await repository.exists('Rice n Beans');

    repository.Model.count.restore();

    expect(result).to.equal(true);
  });

  it('should check if a user exists and return false if it doesnt', async () => {
    sinon.stub(repository.Model, "count")
      .withArgs({name: new RegExp('Not Existent', 'i')})
      .returns(Promise.resolve(0));

    let result = await repository.exists('Not Existent');

    repository.Model.count.restore();

    expect(result).to.equal(false);
  });

});