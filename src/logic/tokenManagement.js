import {
  AuthenticationException,
  InvalidTokenException,
  NotSupportedGrantTypeException,
  ValidationException
} from "../utils/exceptions";
import {isDefined, getUTCNow} from '../utils/utilities';
import * as jwt from '../utils/tokenProvider';
import log from '../utils/logger';

export default class TokenManagement {

  constructor(userRepository, clientRepository, sessionRepository, cryptography) {
    this.userRepository = userRepository;
    this.clientRepository = clientRepository;
    this.sessionRepository = sessionRepository;
    this.cryptography = cryptography;
  }

  async createToken(request) {
    switch (request.grant_type) {
      case 'implicit':
        ['username', 'password', 'client_id'].forEach(property => {
          if (!isDefined(request[property])) {
            throw new ValidationException([property]);
          }
        });

        let client = await this.clientRepository.getByName(request.client_id);

        let user = await this.userRepository.getByUsername(request.username);

        if (!await this.cryptography.isPasswordValid(request.password, user.password)) {
          throw new AuthenticationException(request.username);
        }

        let now = getUTCNow();

        let tokenUser = {
          roles: user.roles,
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email
        };

        let token = await jwt.createToken(tokenUser, client);

        let session = {
          userId: user._id,
          startDate: now,
          token: token,
          client: client._id,
          expirationDate: now + client.tokenTtl,
          state: 'Valid'
        };

        let newSession = await this.sessionRepository.save(session);

        return {
          tokenType: 'Bearer',
          accessToken: newSession.token,
          expiresIn: client.tokenTtl,
          redirectUrl: client.redirectUrl
        };
      default:
        throw new NotSupportedGrantTypeException(request.grant_type);
    }
  }

  async isSessionActive(token) {
    try {
      let userDetails = await jwt.verifyToken(token);

      let isActive = await this.sessionRepository.isSessionActive(userDetails._id, token, getUTCNow());
      if (!isActive) {
        throw new InvalidTokenException();
      }

      return userDetails;
    } catch(error) {
      log.warn('Failed to check if session was active');
      if (error.name !== InvalidTokenException.Name) {
        throw new InvalidTokenException();
      } else {
        throw error;
      }
    }
  }

  async revokeToken(token) {
    if (typeof token !== 'string') {
      return Promise.reject(new ValidationException(['access_token']));
    }
    try {
      let userDetails = await jwt.verifyToken(token);

      return this.sessionRepository.revokeActiveToken(userDetails._id, token, getUTCNow());
    } catch(error) {
      log.warn('Failed to revoke token', error);
      return false;
    }
  }
}