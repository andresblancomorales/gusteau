import UserRepository from '../../src/data/repositories/userRepository';
import ClientRepository from '../../src/data/repositories/clientRepository';
import SessionRepository from '../../src/data/repositories/sessionRepository';
import TokenManagement from '../../src/logic/tokenManagement';
import {
  AuthenticationException,
  ClientNotFoundException,
  NotSupportedGrantTypeException,
  UserNotFoundException, ValidationException
} from "../../src/utils/exceptions";
import * as utils from '../../src/utils/utilities';
import * as cryptography from '../../src/utils/cryptography';
import * as jwt from '../../src/utils/tokenProvider';

describe('TokenManagement', () => {
  let tokenManagement;

  before(done => {
    sinon.stub(utils, 'getUTCNow').returns(1000);

    sinon.stub(cryptography, 'isPasswordValid')
      .withArgs('password', 'p455w0rd')
      .returns(Promise.resolve(true))
      .withArgs('b4d', 'p455w0rd')
      .returns(Promise.resolve(false));

    sinon.stub(jwt, 'createToken')
      .withArgs({
        _id: '1234',
        firstName: 'Andres',
        lastName: 'Blanco',
        username: 'andres@email.com',
        email: 'andres@email.com',
        roles: ['guest']
      }, {
        _id: '0987',
        name: 'gusteau',
        redirectUrl: 'http://www.gusteau.com',
        tokenTtl: 60,
      }).returns(Promise.resolve('70k3n'));

    sinon.stub(jwt, 'verifyToken')
      .withArgs('70k3n')
      .returns(Promise.resolve({
        _id: '1234'
      }))
      .withArgs('3xp1r3d')
      .returns(Promise.resolve({
        _id: '1234'
      }))
      .withArgs('b4d')
      .returns(Promise.reject(new Error('POW!')));


    let userRepository = new UserRepository();
    sinon.stub(userRepository, 'getByUsername')
      .withArgs('andres@email.com')
      .returns(Promise.resolve({
        _id: '1234',
        firstName: 'Andres',
        lastName: 'Blanco',
        username: 'andres@email.com',
        email: 'andres@email.com',
        password: 'p455w0rd',
        roles: ['guest']
      }))
      .withArgs('notExistent@email.com')
      .returns(Promise.reject(new UserNotFoundException('notExistent@email.com')));

    let clientRepository = new ClientRepository();
    sinon.stub(clientRepository, 'getByName')
      .withArgs('gusteau')
      .returns(Promise.resolve({
        _id: '0987',
        name: 'gusteau',
        redirectUrl: 'http://www.gusteau.com',
        tokenTtl: 60,
      }))
      .withArgs('notExistent')
      .returns(Promise.reject(new ClientNotFoundException('notExistent')));

    let sessionRepository = new SessionRepository();
    sinon.stub(sessionRepository, 'save')
      .withArgs({
        userId: '1234',
        startDate: 1000,
        token: '70k3n',
        client: '0987',
        expirationDate: 1060,
        state: 'Valid'
      }).returns({
      _id: '9999',
      userId: '5678',
      startDate: 1000,
      token: '70k3n',
      client: '0987',
      expirationDate: 1060,
      state: 'Valid'
    });
    sinon.stub(sessionRepository, 'isSessionActive')
      .withArgs(
        '1234',
        '70k3n',
        1000
      )
      .returns(Promise.resolve(true))
      .withArgs(
        '1234',
        '3xp1r3d',
        1000
      ).returns(Promise.resolve(false));
    sinon.stub(sessionRepository, 'revokeActiveToken')
      .withArgs(
        '1234',
        '70k3n',
        1000
      )
      .returns(Promise.resolve(true))
      .withArgs(
        '1234',
        '3xp1r3d',
        1000
      ).returns(Promise.resolve(false));

    tokenManagement = new TokenManagement(userRepository, clientRepository, sessionRepository, cryptography);

    done();
  });

  after(() => {
    utils.getUTCNow.restore();
    cryptography.isPasswordValid.restore();
    jwt.createToken.restore();
    jwt.verifyToken.restore();
  });

  it('should create a new session and return the generated token along with it', async () => {
    let session = await tokenManagement.createToken({
      grant_type: 'implicit',
      username: 'andres@email.com',
      password: 'password',
      client_id: 'gusteau'
    });

    expect(session).to.deep.equal({
      tokenType: 'Bearer',
      accessToken: '70k3n',
      expiresIn: 60,
      redirectUrl: 'http://www.gusteau.com'
    });
  });

  it('should try to create a new session and throw a NotSupportedGranTypeException if grant type does not exist', done => {
    tokenManagement.createToken({
      grant_type: 'password',
      username: 'andres@email.com',
      password: 'password',
      client_id: 'gusteau'
    }).catch(error => {
      expect(error.name).to.equal(NotSupportedGrantTypeException.Name);
      expect(error.grantType).to.equal('password');
      done();
    });
  });

  it('should try to create a new session and not all required fields are sent in the request', done => {
    tokenManagement.createToken({
      grant_type: 'implicit',
      password: 'password',
      client_id: 'gusteau'
    }).catch(error => {
      expect(error.name).to.equal(ValidationException.Name);
      expect(error.fields).to.deep.equal(['username']);
      done();
    });
  });

  it('should try to create a new session and throw an UserNotFoundException if the user does not exist', done => {
    tokenManagement.createToken({
      grant_type: 'implicit',
      username: 'notExistent@email.com',
      password: 'password',
      client_id: 'gusteau'
    }).catch(error => {
      expect(error.name).to.equal(UserNotFoundException.Name);
      expect(error.username).to.equal('notExistent@email.com');
      done();
    });
  });

  it('should try to create a new session and throw an AuthenticationException if an invalid password is provided', done => {
    tokenManagement.createToken({
      grant_type: 'implicit',
      username: 'andres@email.com',
      password: 'b4d',
      client_id: 'gusteau'
    }).catch(error => {
      expect(error.name).to.equal(AuthenticationException.Name);
      done();
    });
  });

  it('should try to create a new session and throw a ClientNotFoundException if an invalid client is provided', done => {
    tokenManagement.createToken({
      grant_type: 'implicit',
      username: 'andres@email.com',
      password: 'b4d',
      client_id: 'notExistent'
    }).catch(error => {
      expect(error.name).to.equal(ClientNotFoundException.Name);
      expect(error.client).to.equal('notExistent');
      done();
    });
  });

  it('should check if a session is active and return true if it is', async () => {
    let isActive = await tokenManagement.isSessionActive('70k3n');

    expect(isActive).to.be.true;
  });

  it('should check if a session is active and return false if it is not', async () => {
    let isActive = await tokenManagement.isSessionActive('3xp1r3d');

    expect(isActive).to.be.false;
  });

  it('should check if a session is active and return false if the jwt validation fails', async () => {
    let isActive = await tokenManagement.isSessionActive('b4d');

    expect(isActive).to.be.false;
  });

  it('should revoke a session and return true if successful', async () => {
    let isActive = await tokenManagement.revokeToken('70k3n');

    expect(isActive).to.be.true;
  });

  it('should try to revoke a session and return false if a tokens session was already expired', async () => {
    let isActive = await tokenManagement.revokeToken('3xp1r3d');

    expect(isActive).to.be.false;
  });

  it('should try to revoke a session and return false if the jwt verification fails', async () => {
    let isActive = await tokenManagement.revokeToken('b4d');

    expect(isActive).to.be.false;
  });

});
