import BaseResource from './baseResource';
import log from '../utils/logger';
import {
  AuthenticationException,
  ClientNotFoundException,
  UserNotFoundException,
  ValidationException,
  NotSupportedGrantTypeException
} from "../utils/exceptions";

export default class TokenResource extends BaseResource {
  constructor(tokenManagement) {
    super();
    this.tokenManagement = tokenManagement;
    this.postToken = this.postToken.bind(this);
    this.deleteToken = this.deleteToken.bind(this);
  }

  postToken(request, response) {
    let payload = request.body;

    this.tokenManagement.createToken(payload)
      .then(token => {
        log.info(`Token successfully created for user: ${request.username}`);
        response.status(201);
        response.json(token);
      })
      .catch(error => {
        log.warn(`Failed to create token for user: ${request.username}`);
        switch (error.name) {
          case UserNotFoundException.Name:
          case AuthenticationException.Name:
            response.status(401);
            response.end();
            break;
          case ValidationException.Name:
          case ClientNotFoundException.Name:
          case NotSupportedGrantTypeException.Name:
            response.status(400);
            response.json(error);
            break;
          default:
            response.status(500);
            response.end();
            break;
        }
      });
  }

  deleteToken(request, response) {
    let payload = request.body;

    this.tokenManagement.revokeToken(payload.access_token)
      .then(successful => {
        if (successful) {
          log.info('Successfully revoked token');
        } else {
          log.warn('Failed to revoke token, session was not active');
        }
        response.status(200);
        response.end();
      })
      .catch(error => {
        log.warn('Failed to revoke token', error);
        switch(error.name) {
          case ValidationException.Name:
            response.status(400);
            response.json(error);
            break;
        }
      });
  }

  register(expressApp) {
    expressApp.route('/token')
      .post(this.postToken)
      .delete(this.deleteToken);
  }
}