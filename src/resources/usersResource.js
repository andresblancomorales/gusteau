import BaseResource from './baseResource';
import log from '../utils/logger';
import {UserAlreadyExistsException, ValidationException} from '../utils/exceptions';

export default class UsersResource extends BaseResource {

  constructor(userManagement) {
    super();
    this.userManagement = userManagement;
    this.postUser = this.postUser.bind(this);
  }

  postUser(request, response) {
    let user = request.body;

    this.userManagement.createUser(user)
      .then(newUser => {
        log.info(`User ${newUser.username} created successfully`, newUser);
        response.status(201);
        response.json(newUser);
      })
      .catch(error => {
        log.warn(`Failed to create user ${user.username}`, error);
        switch(error.name) {
          case UserAlreadyExistsException.Name:
            response.status(409);
            response.json(error);
            break;
          case ValidationException.Name:
            response.status(400);
            response.json(error);
            break;
          default:
            response.status(500);
            break;
        }
      });
  }

  register(expressApp) {
    expressApp.route('/users')
      .post(this.postUser);
  }
}