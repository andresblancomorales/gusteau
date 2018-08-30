import {isDefined} from '../utils/utilities';
import {UserAlreadyExistsException, ValidationException} from '../utils/exceptions';

const DEFAULT_ROLES = ['chef'];

export default class UserManagement {
  constructor(userRepository, cryptography) {
    this.userRepository = userRepository;
    this.cryptography = cryptography;
  }

  async createUser(user) {
    let userExists = await this.userRepository.exists(user.username);

    if (userExists) {
      throw new UserAlreadyExistsException(user.username);
    }

    if (!isDefined(user.password)) {
      throw new ValidationException(['password']);
    }

    let salt = await this.cryptography.generateSalt();
    let hash = await this.cryptography.encryptText(user.password, salt);

    let newUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.email,
      email: user.email,
      password: hash,
      roles: DEFAULT_ROLES
    };

    return this.userRepository.save(newUser).then(u => {
      return {
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username,
        email: u.email,
        roles: u.roles
      }
    });
  }
}