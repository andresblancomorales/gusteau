import request from 'supertest';
import express from 'express';
import UsersResource from '../../src/resources/usersResource';
import {UserAlreadyExistsException, ValidationException} from "../../src/utils/exceptions";

describe('UsersResource', () => {
  let app;
  let server;

  before(done => {
    app = express();
    app.use(express.json());

    let userManagement = {
      createUser: () => {
      }
    };

    sinon.stub(userManagement, 'createUser')
      .withArgs({
        firstName: 'Andres',
        lastName: 'Blanco',
        username: 'andres@email.com',
        email: 'andres@email.com',
        password: 'password'
      })
      .returns(Promise.resolve({
        firstName: 'Andres',
        lastName: 'Blanco',
        username: 'andres@email.com',
        email: 'andres@email.com'
      }))
      .withArgs({
        firstName: 'Andres',
        lastName: 'Blanco',
        username: 'existent@email.com',
        email: 'existent@email.com',
        password: 'password'
      })
      .returns(Promise.reject(new UserAlreadyExistsException('existent@email.com')))
      .withArgs({
        firstName: 'Andres',
        lastName: 'Blanco',
        username: 'andres@email.com',
        email: 'andres@email.com'
      })
      .returns(Promise.reject(new ValidationException(['password'])));

    let resource = new UsersResource(userManagement);

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

  it('should create a new user', done => {
    request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({
        firstName: 'Andres',
        lastName: 'Blanco',
        username: 'andres@email.com',
        email: 'andres@email.com',
        password: 'password'
      })
      .expect(201, {
        firstName: 'Andres',
        lastName: 'Blanco',
        username: 'andres@email.com',
        email: 'andres@email.com'
      }, done);
  });

  it('should try to create a new user and return Conflict if the user already exists', done => {
    request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({
        firstName: 'Andres',
        lastName: 'Blanco',
        username: 'existent@email.com',
        email: 'existent@email.com',
        password: 'password'
      })
      .expect(409, {
        name: UserAlreadyExistsException.Name,
        username: 'existent@email.com'
      }, done);
  });

  it('should try to create a new user and return BadRequest if there is a validation error', done => {
    request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({
        firstName: 'Andres',
        lastName: 'Blanco',
        username: 'andres@email.com',
        email: 'andres@email.com'
      })
      .expect(400, {
        name: ValidationException.Name,
        fields: ['password']
      }, done);
  })
});
