import Configuration from '../utils/configuration';
import {RecipeExistsException} from "../utils/exceptions";

const RecipeStates = {
  ACTIVE: 'Active',
  ARCHIVED: 'ARCHIVED'
};

export default class RecipeManagement {
  constructor(recipeRepository) {
    this.recipeRepository = recipeRepository;
  }

  getRecipes(offsetRecipe = undefined) {
    return this.recipeRepository.getRecipes(offsetRecipe, Configuration.QUERY_LIMIT);
  }

  async createRecipe(recipe, session) {
    let newRecipe = {
      ...recipe,
      user: session._id,
      state: RecipeStates.ACTIVE
    };

    if (!await this.recipeRepository.exists(newRecipe.name)) {
      return this.recipeRepository.save(newRecipe);
    } else {
      throw new RecipeExistsException(recipe.name);
    }
  }
}