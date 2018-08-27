import {AuthenticationException, NotSupportedGrantTypeException, ValidationException} from "../utils/exceptions";
import {isDefined, getUTCNow} from '../utils/utilities';
import * as jwt from '../utils/tokenProvider';
//import log from '../utils/logger';

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

  // async revokeToken(token) {
  //   try {
  //     let userDetails = await jwt.verifyToken(token);
  //
  //   } catch(error) {
  //     log.warn('Failed to revoke token', error);
  //     return false;
  //   }
  // }
}