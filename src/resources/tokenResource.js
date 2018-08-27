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

  register(expressApp) {
    expressApp.route('/token')
      .post(this.postToken);
  }
}