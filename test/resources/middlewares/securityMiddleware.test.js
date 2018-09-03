import SecurityMiddleware from '../../../src/resources/middlewares/securityMiddleware';
import express from "express";
import {InvalidTokenException} from "../../../src/utils/exceptions";
import request from "supertest";

describe('SecurityMiddleware', () => {

  let app;
  let server;

  before(done => {
    app = express();
    app.use(express.json());

    let tokenManagement = {
      isSessionActive: () => {

      }
    };

    sinon.stub(tokenManagement, 'isSessionActive')
      .withArgs('70k3n')
      .returns(Promise.resolve({_id: '001', username: 'andres@email.com'}))
      .withArgs('b4d')
      .returns(Promise.reject(new InvalidTokenException()));

    let securityMiddleware = new SecurityMiddleware(tokenManagement);

    app.use(securityMiddleware.middleWare);

    app.route('/hello')
      .get((request, response) => {
        response.status(200);
        response.json(request.gusteauSession);
      });

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


  it('should add the session data to the request if the token is valid', done => {
    request(app)
      .get('/hello')
      .set('Authorization', 'Bearer 70k3n')
      .expect(200, {_id: '001', username: 'andres@email.com'}, done);
  });

  it('should reject the request if the token is invalid', done => {
    request(app)
      .get('/hello')
      .set('Authorization', 'Bearer b4d')
      .expect(401, done);
  });

  it('should reject the request if the invalid token type is specified', done => {
    request(app)
      .get('/hello')
      .set('Authorization', 'Basic 3nc0d3d')
      .expect(401, done);
  });

  it('should reject the request if the authorization header is not sent', done => {
    request(app)
      .get('/hello')
      .expect(401, done);
  });
});
