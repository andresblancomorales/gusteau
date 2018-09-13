
export default class RecipeManagement {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  getCategories() {
    return this.categoryRepository.getAll();
  }
}