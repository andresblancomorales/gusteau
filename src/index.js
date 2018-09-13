import express from 'express';
import Configuration from './utils/configuration';
import connection from './data/connection';
import UserRepository from './data/repositories/userRepository';
import ClientRepository from './data/repositories/clientRepository';
import SessionRepository from './data/repositories/sessionRepository';
import CategoryRepository from "./data/repositories/categoryRepository";
import UserManagement from './logic/userManagement';
import TokenManagement from './logic/tokenManagement';
import CategoryManagement from './logic/categoryManagement';
import UsersResource from './resources/usersResource';
import TokenResource from './resources/tokenResource';
import * as cryptography from './utils/cryptography';
import logger from './utils/logger';
import RecipeRepository from './data/repositories/recipeRepository';
import RecipeManagement from './logic/recipeManagement';
import RecipesResource from "./resources/recipesResource";
import AuthorizationMiddleware from "./resources/middlewares/securityMiddleware";
import CategoriesResource from "./resources/categoriesResource";

connection.then(error => {
  if (error) {
    logger.error('Failed to acquire database connection');
  }
  logger.info('Successfully acquired database connection');
}).catch(error => {
  if (error) {
    logger.error('Failed to acquire database connection', error);
    process.exit(1);
  }
});

const app = express();
app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "POST, PUT, DELETE, GET");
  next();
});

let userRepository = new UserRepository();
let userManagement = new UserManagement(userRepository, cryptography);
let usersResource = new UsersResource(userManagement);
usersResource.register(app);

let clientRepository = new ClientRepository();
let sessionRepository = new SessionRepository();
let tokenManagement = new TokenManagement(userRepository, clientRepository, sessionRepository, cryptography);
let tokenResource = new TokenResource(tokenManagement);
tokenResource.register(app);

let authorizationMiddleware = new AuthorizationMiddleware(tokenManagement);

let recipeRepository = new RecipeRepository();
let recipeManagement = new RecipeManagement(recipeRepository);
let recipesResource = new RecipesResource(recipeManagement, authorizationMiddleware.middleWare);
recipesResource.register(app);

let categoryRepository = new CategoryRepository();
let categoryManagement = new CategoryManagement(categoryRepository);
let categoriesResource = new CategoriesResource(categoryManagement, authorizationMiddleware.middleWare);
categoriesResource.register(app);

app.listen(Configuration.SERVICE_PORT, () => {
});

