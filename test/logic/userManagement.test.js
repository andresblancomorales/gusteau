import UserManagement from '../../src/logic/userManagement';
import UserRepository from '../../src/data/repositories/userRepository';
import {UserAlreadyExistsException, ValidationException} from '../../src/utils/exceptions';

describe('UserManagement', () => {
  let userManagement;

  before(done => {
    let repository = new UserRepository();
    sinon.stub(repository, 'save')
      .withArgs({
        firstName: 'Andres',
        lastName: 'Blanco',
        username: 'andres@email.com',
        email: 'andres@email.com',
        password: 'p455w0rd',
        roles: ['chef']
      })
      .returns(Promise.resolve({
        firstName: 'Andres',
        lastName: 'Blanco',
        username: 'andres@email.com',
        email: 'andres@email.com',
        roles: ['chef']
      }));

    sinon.stub(repository, 'exists')
      .withArgs('andres@email.com')
      .returns(Promise.resolve(false))
      .withArgs('existent@email.com')
      .returns(Promise.resolve(true));

    let cryptography = {
      generateSalt: () => {
      },
      encryptText: () => {
      }
    };
    sinon.stub(cryptography, 'generateSalt')
      .returns(Promise.resolve('5417'));
    sinon.stub(cryptography, 'encryptText')
      .withArgs('password', '5417')
      .returns(Promise.resolve('p455w0rd'));

    userManagement = new UserManagement(repository, cryptography);

    done();
  });

  it('should create a user if it doesnt exist', async () => {
    let createdUser = await userManagement.createUser({
      firstName: 'Andres',
      lastName: 'Blanco',
      username: 'andres@email.com',
      email: 'andres@email.com',
      password: 'password'
    });

    expect(createdUser).to.deep.equal({
      firstName: 'Andres',
      lastName: 'Blanco',
      username: 'andres@email.com',
      email: 'andres@email.com',
      roles: ['chef']
    });
  });

  it('should try to create a user and fail if it exists', done => {
    userManagement.createUser({
      firstName: 'Andres',
      lastName: 'Blanco',
      username: 'existent@email.com',
      email: 'existent@email.com',
      password: 'password'
    }).catch(error => {
      expect(error.name).to.equal(UserAlreadyExistsException.Name);
      done();
    });
  });

  it('should try to create a user and fail if no password is sent', done => {
    userManagement.createUser({
      firstName: 'Andres',
      lastName: 'Blanco',
      username: 'andres@email.com',
      email: 'andres@email.com'
    }).catch(error => {
      expect(error.name).to.equal(ValidationException.Name);
      expect(error.fields).to.deep.equal(['password']);
      done();
    });
  })
});
