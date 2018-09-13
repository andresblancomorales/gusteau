import BaseResource from './baseResource';
import log from '../utils/logger';
import {RecipeExistsException, ValidationException} from "../utils/exceptions";

export default class RecipesResource extends BaseResource {
  constructor(recipeManagement, authorizationMiddleware) {
    super();
    this.recipeManagement = recipeManagement;
    this.authorizationMiddleware = authorizationMiddleware;
    this.getAll = this.getAll.bind(this);
    this.postRecipe = this.postRecipe.bind(this);
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
        log.error('Something went really wrong when getting the recipes', error);
        response.status(500);
        response.end();
      })
  }

  postRecipe(request, response) {
    let session = request.gusteauSession;
    log.info(`Creating recipe: ${request.body} for user ${session._id}`);
    this.recipeManagement.createRecipe(request.body, session)
      .then(newRecipe => {
        log.info(`Successfully create recipe: ${newRecipe._id}`);
        response.status(201);
        response.json(newRecipe);
      })
      .catch(error => {
        log.warn(`Failed to create recipe ${request.body} for user ${session._id}`, error);
        switch (error.name) {
          case ValidationException.Name:
          case RecipeExistsException.Name:
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
    expressApp.route('/recipes')
      .get([this.authorizationMiddleware, this.getAll])
      .post(this.authorizationMiddleware, this.postRecipe)
  }
}
