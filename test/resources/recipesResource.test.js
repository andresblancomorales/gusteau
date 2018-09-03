import request from 'supertest';
import express from 'express';
import RecipesResource from '../../src/resources/recipesResource';
import {testAuthorizationMiddleware} from './authorizationMiddlewareMock';

describe('RecipesResource', () => {

  let app;
  let server;

  before(done => {
    app = express();
    app.use(express.json());

    let recipeManagement = {
      getRecipes: () => {
      }
    };

    sinon.stub(recipeManagement, 'getRecipes')
      .withArgs(undefined)
      .returns(Promise.resolve([{_id: '001', name: 'Cool recipe'}, {_id: '002', name: 'Nice recipe'}]))
      .withArgs('001')
      .returns(Promise.resolve([{_id: '002', name: 'Nice recipe'}]))
      .withArgs('b4d')
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

});