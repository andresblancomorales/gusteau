import request from 'supertest';
import express from 'express';
import TokenResource from '../../src/resources/tokenResource';
import {
  AuthenticationException,
  ClientNotFoundException,
  UserNotFoundException,
  ValidationException,
  NotSupportedGrantTypeException
} from "../../src/utils/exceptions";

describe('TokenResource', () => {
  let app;
  let server;

  before(done => {
    app = express();
    app.use(express.json());

    let tokenManagement = {
      createToken: () => {
      },
      revokeToken: () => {

      }
    };

    sinon.stub(tokenManagement, 'revokeToken')
      .withArgs('70k3n')
      .returns(Promise.resolve(true))
      .withArgs({})
      .returns(Promise.reject(new ValidationException(['access_token'])));

    sinon.stub(tokenManagement, 'createToken')
      .withArgs({
        grant_type: 'implicit',
        username: 'andres@email.com',
        password: 'password',
        client_id: 'gusteau'
      })
      .returns(Promise.resolve({
        tokenType: 'Bearer',
        accessToken: '70k3n',
        expiresIn: 60,
        redirectUrl: 'http://www.gusteau.com'
      }))
      .withArgs({
        grant_type: 'password',
        username: 'andres@email.com',
        password: 'password',
        client_id: 'gusteau'
      })
      .returns(Promise.reject(
        new NotSupportedGrantTypeException('password')
      ))
      .withArgs({
        grant_type: 'implicit',
        username: 'notExistent@email.com',
        password: 'password',
        client_id: 'gusteau'
      })
      .returns(Promise.reject(
        new UserNotFoundException('notExistent@email.com')
      ))
      .withArgs({
        grant_type: 'implicit',
        username: 'andres@email.com',
        password: 'b4d',
        client_id: 'gusteau'
      })
      .returns(Promise.reject(
        new AuthenticationException()
      ))
      .withArgs({
        grant_type: 'implicit',
        username: 'andres@email.com',
        password: 'password',
        client_id: 'notExistent'
      })
      .returns(Promise.reject(
        new ClientNotFoundException('notExistent')
      ))
      .withArgs({
        grant_type: 'implicit',
        password: 'password',
        client_id: 'gusteau'
      })
      .returns(Promise.reject(
        new ValidationException(['username'])
      ))
      .withArgs({
        grant_type: 'implicit',
        username: 'timebomb@email.com',
        password: 'password',
        client_id: 'gusteau'
      })
      .returns(Promise.reject(
        new Error('Something went wrong')
      ));

    let resource = new TokenResource(tokenManagement);

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

  it('should create a new token', done => {
    request(app)
      .post('/token')
      .set('Content-Type', 'application/json')
      .send({
        grant_type: 'implicit',
        username: 'andres@email.com',
        password: 'password',
        client_id: 'gusteau'
      })
      .expect(201, {
        tokenType: 'Bearer',
        accessToken: '70k3n',
        expiresIn: 60,
        redirectUrl: 'http://www.gusteau.com'
      }, done);
  });

  it('should try to create a new token and respond with 401 if the user is not found', done => {
    request(app)
      .post('/token')
      .set('Content-Type', 'application/json')
      .send({
        grant_type: 'implicit',
        username: 'notExistent@email.com',
        password: 'password',
        client_id: 'gusteau'
      })
      .expect(401, done);
  });

  it('should try to create a new token and respond with 401 if the wrong password is provided', done => {
    request(app)
      .post('/token')
      .set('Content-Type', 'application/json')
      .send({
        grant_type: 'implicit',
        username: 'andres@email.com',
        password: 'b4d',
        client_id: 'gusteau'
      })
      .expect(401, done);
  });

  it('should try to create a new token and respond with 400 if there is a validation error', done => {
    request(app)
      .post('/token')
      .set('Content-Type', 'application/json')
      .send({
        grant_type: 'implicit',
        password: 'password',
        client_id: 'gusteau'
      })
      .expect(400, {
        name: ValidationException.Name,
        fields: ['username']
      }, done);
  });

  it('should try to create a new token and respond with 400 if the provided client does not exist', done => {
    request(app)
      .post('/token')
      .set('Content-Type', 'application/json')
      .send({
        grant_type: 'implicit',
        username: 'andres@email.com',
        password: 'password',
        client_id: 'notExistent'
      })
      .expect(400, {
        name: ClientNotFoundException.Name,
        client: 'notExistent'
      }, done);
  });

  it('should try to create a new token and respond with 400 if a not supported grant type is provided', done => {
    request(app)
      .post('/token')
      .set('Content-Type', 'application/json')
      .send({
        grant_type: 'password',
        username: 'andres@email.com',
        password: 'password',
        client_id: 'gusteau'
      })
      .expect(400, {
        name: NotSupportedGrantTypeException.Name,
        grantType: 'password'
      }, done);
  });

  it('should try to create a new token and respond with 500 if an unexpected error is thrown', done => {
    request(app)
      .post('/token')
      .set('Content-Type', 'application/json')
      .send({
        grant_type: 'implicit',
        username: 'timebomb@email.com',
        password: 'password',
        client_id: 'gusteau'
      })
      .expect(500, done);
  });

  it('should try to revoke a token and return OK', done => {
    request(app)
      .delete('/token')
      .set('Content-Type', 'application/json')
      .send({
        access_token: '70k3n'
      })
      .expect(200, done);
  });

  it('should try to revoke a token and return BadRequest if there is a validation exception', done => {
    request(app)
      .delete('/token')
      .set('Content-Type', 'application/json')
      .send({
        access_token: {}
      })
      .expect(400, done);
  });
});
