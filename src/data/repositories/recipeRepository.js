import {Schema} from 'mongoose';
import mongoose from 'mongoose';
import BaseRepository from './baseRepository';
import log from '../../utils/logger';
import * as ex from '../../utils/exceptions';
import {isDefined} from '../../utils/utilities';

const RecipeSchema = new Schema({
  name: {type: String, required: true},
  category: {type: Schema.Types.ObjectId, required: true},
  user: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
  pictureUrl: {type: String, required: false},
  state: {type: String, required: true},
  ingredients: {
    type: [
      {
        name: {type: String, required: true},
        amount: {type: String, required: true}
      }
    ],
    required: true,
    validate: {
      validator: value => {
        return value.length > 0 && value.length <= 10;
      },
      message: props => `${props.value} must contain at least 1 and less than 10`
    }
  },
  preparation: {
    type: [String],
    required: true,
    validate: {
      validator: value => {
        return value.length > 0;
      },
      message: props => `${props.value} must contain at least 1`
    }
  }
}, {
  collection: 'recipes'
});

RecipeSchema.statics.getRecipes = async function (offsetRecipe, limit) {
  if (!isDefined(offsetRecipe)) {
    return this.find().limit(limit).populate('user').sort({_id: -1});
  }

  return this.find({_id: {$lt: offsetRecipe}}).limit(limit).populate('user').sort({_id: -1});
};

const Recipe = mongoose.model('Recipe', RecipeSchema);

export default class RecipeRepository extends BaseRepository {
  constructor() {
    super();
    this.Schema = RecipeSchema;
    this.Model = Recipe;
  }

  async getRecipes(offsetRecipe = undefined, limit = 10) {
    try {
      return await this.Model.getRecipes(offsetRecipe, limit);
    } catch (error) {
      log.error(`Failed to get recipes. Offset: ${offsetRecipe}. Limit ${limit}`, error);
      return Promise.reject(ex.transform(error));
    }
  }
}