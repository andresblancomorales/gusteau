import BaseResource from './baseResource';
import log from '../utils/logger';

export default class CategoriesResource extends BaseResource {
  constructor(categoryManagement, authorizationMiddleware) {
    super();
    this.categoryManagement = categoryManagement;
    this.authorizationMiddleware = authorizationMiddleware;
    this.getAll = this.getAll.bind(this);
  }

  getAll(request, response) {
    log.info('Getting all categories');
    this.categoryManagement.getCategories()
      .then(categories => {
        response.status(200);
        response.json(categories);
      })
      .catch(error => {
        log.error('Failed to get the categories', error);
        response.status(500);
        response.end();
      })
  }

  register(expressApp) {
    expressApp.route('/categories')
      .get([this.authorizationMiddleware, this.getAll])
  }
}
