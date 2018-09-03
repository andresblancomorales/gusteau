import BaseResource from './baseResource';
import log from '../utils/logger';

export default class RecipesResource extends BaseResource {
  constructor(recipeManagement, authorizationMiddleware) {
    super();
    this.recipeManagement = recipeManagement;
    this.authorizationMiddleware = authorizationMiddleware;
    this.getAll = this.getAll.bind(this);
  }

  getAll(request, response) {
    log.info(`Getting recipes. Offset: ${request.query.offset}`);
    this.recipeManagement.getRecipes(request.query.offset)
      .then(recipes => {
        log.info(`Successfully got ${recipes.length} recipes. Offset: ${request.query.offset}`);
        response.status(200);
        response.json(recipes);
      })
      .catch(error => {
        log.error('Something get really wrong when getting the recipes', error);
        response.status(500);
        response.end();
      })
  }

  register(expressApp) {
    expressApp.route('/recipes')
      .get([this.authorizationMiddleware, this.getAll])
  }
}