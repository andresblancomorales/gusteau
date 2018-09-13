import request from 'supertest';
import express from 'express';
import CategoriesResource from '../../src/resources/categoriesResource';
import {testAuthorizationMiddleware} from './authorizationMiddlewareMock';

describe('CategoriesResource', () => {

  let app;
  let server;

  before(done => {
    app = express();
    app.use(express.json());

    let categoryManagement = {
      getCategories: () => {
      },
    };

    sinon.stub(categoryManagement, 'getCategories')
      .onFirstCall().returns(Promise.resolve([{_id: '001', name: 'pasta'}, {_id: '002', name: 'pizza'}]))
      .onSecondCall().returns(Promise.reject(new Error('Kapow!')));


    let resource = new CategoriesResource(categoryManagement, testAuthorizationMiddleware);

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

  it('should get all categories if authorized', done => {
    request(app)
      .get('/categories')
      .set('Authorization', 'Bearer 70k3n')
      .set('Content-Type', 'application/json')
      .expect(200, [{_id: '001', name: 'pasta'}, {_id: '002', name: 'pizza'}], done);
  });

  it('should try to get all categories and return 500 if something goes wrong', done => {
    request(app)
      .get('/categories')
      .set('Authorization', 'Bearer 70k3n')
      .set('Content-Type', 'application/json')
      .expect(500, done);
  });

  it('should try to get all categories and return 401 if unauthorized', done => {
    request(app)
      .get('/categories')
      .set('Content-Type', 'application/json')
      .expect(401, done);
  });
});