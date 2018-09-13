import request from 'supertest';
import express from 'express';
import RecipesResource from '../../src/resources/recipesResource';
import {testAuthorizationMiddleware} from './authorizationMiddlewareMock';
import {RecipeExistsException, ValidationException} from "../../src/utils/exceptions";

describe('RecipesResource', () => {

  let app;
  let server;

  before(done => {
    app = express();
    app.use(express.json());

    let recipeManagement = {
      getRecipes: () => {
      },
      createRecipe: (recipe, session) => {
      }
    };

    sinon.stub(recipeManagement, 'getRecipes')
      .withArgs(undefined)
      .returns(Promise.resolve([{_id: '001', name: 'Cool recipe'}, {_id: '002', name: 'Nice recipe'}]))
      .withArgs('001')
      .returns(Promise.resolve([{_id: '002', name: 'Nice recipe'}]))
      .withArgs('b4d')
      .returns(Promise.reject(new Error('Kapow!')));

    sinon.stub(recipeManagement, 'createRecipe')
      .withArgs({name: 'Rice n Beans'}, {_id: '001'})
      .returns(Promise.resolve({_id: '001', name: 'Rice n Beans', user: '001'}))
      .withArgs({name: 'Bad Recipe'}, {_id: '001'})
      .returns(Promise.reject(new ValidationException(['name'])))
      .withArgs({name: 'Duplicate Recipe'}, {_id: '001'})
      .returns(Promise.reject(new RecipeExistsException('Duplicate Recipe')))
      .withArgs({name: 'Blow up'}, {_id: '001'})
      .returns(Promise.reject(new Error('Kapow!')));

    let resource = new RecipesResource(recipeManagement, testAuthorizationMiddleware);

    resource.register(app);

    server = app.listen(error => {
      if (error) {
        return done(error);
      }
      done();
    });
  });

  after(() => {
    server.close();
  });

  it('should get all recipes if authorized', done => {
    request(app)
      .get('/recipes')
      .set('Authorization', 'Bearer 70k3n')
      .set('Content-Type', 'application/json')
      .expect(200, [{_id: '001', name: 'Cool recipe'}, {_id: '002', name: 'Nice recipe'}], done);
  });

  it('should get all recipes from an offset if authorized', done => {
    request(app)
      .get('/recipes?offset=001')
      .set('Authorization', 'Bearer 70k3n')
      .set('Content-Type', 'application/json')
      .expect(200, [{_id: '002', name: 'Nice recipe'}], done);
  });

  it('should try to get all recipes from an offset if authorized and return 500 if it fails', done => {
    request(app)
      .get('/recipes?offset=b4d')
      .set('Authorization', 'Bearer 70k3n')
      .set('Content-Type', 'application/json')
      .expect(500, done);
  });

  it('should try to get all recipes and return 401 if unauthorized', done => {
    request(app)
      .get('/recipes')
      .set('Content-Type', 'application/json')
      .expect(401, done);
  });

  it('should create a recipe if authorized', done => {
    request(app)
      .post('/recipes')
      .send({name: 'Rice n Beans'})
      .set('Authorization', 'Bearer 70k3n')
      .set('Content-Type', 'application/json')
      .expect(201, {_id: '001', name: 'Rice n Beans', user: '001'}, done);
  });

  it('should try to create a recipe and return 400 if validation error', done => {
    request(app)
      .post('/recipes')
      .send({name: 'Bad Recipe'})
      .set('Authorization', 'Bearer 70k3n')
      .set('Content-Type', 'application/json')
      .expect(400, {
        name: 'ValidationException',
        fields: ['name']
      }, done);
  });

  it('should try to create a recipe and return 400 if the recipe exists', done => {
    request(app)
      .post('/recipes')
      .send({name: 'Duplicate Recipe'})
      .set('Authorization', 'Bearer 70k3n')
      .set('Content-Type', 'application/json')
      .expect(400, {
        name: 'RecipeExistsException',
        recipeName: 'Duplicate Recipe'
      }, done);
  });

  it('should try to create a recipe and return 500 if theres an unexpected error', done => {
    request(app)
      .post('/recipes')
      .send({name: 'Blow up'})
      .set('Authorization', 'Bearer 70k3n')
      .set('Content-Type', 'application/json')
      .expect(500, done);
  });

  it('should try to create a recipe and return 401 if unauthorized', done => {
    request(app)
      .post('/recipes')
      .send({name: 'Awesome recipe!'})
      .expect(401, done);
  });

});