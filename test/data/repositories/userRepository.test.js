import UserRepository from '../../../src/data/repositories/userRepository';
import {UserNotFoundException} from "../../../src/utils/exceptions";

describe('UserRepository', () => {
  let repository;

  before(done => {
    repository = new UserRepository();
    done();
  });

  it('should have the correct Model', done => {
    let model = repository.Model;

    expect(model.modelName).to.equal('User');
    expect(model.schema).to.equal(repository.Schema);
    expect(typeof model.exists).to.equal('function');
    expect(typeof model.getByUsername).to.equal('function');

    done();
  });

  it('should have the correct schema properties', done => {
    let schema = repository.Schema;

    expect(schema.options.collection).to.equal('users');
    expect(schema.obj).to.include.all.keys('firstName', 'lastName', 'username', 'email', 'password', 'roles');
    expect(schema.obj.firstName).to.deep.equal({type: String, required: true});
    expect(schema.obj.lastName).to.deep.equal({type: String, required: true});
    expect(schema.obj.username).to.deep.equal({type: String, lowercase: true, required: true});
    expect(schema.obj.email).to.deep.equal({type: String, lowercase: true, required: true});
    expect(schema.obj.password).to.deep.equal({type: String, required: true, select: false});
    expect(schema.obj.roles.type).to.deep.equal([String]);
    expect(schema.obj.roles.required).to.be.true;
    expect(schema.obj.roles.validate.validator(['role1'])).to.be.true;
    expect(schema.obj.roles.validate.validator([])).to.be.false;
    expect(schema.obj.roles.validate.message({value: 'roles'})).to.equal('roles must contain at least 1');

    done();
  });

  it('should check if a user exists and return true if it does', async () => {
    sinon.stub(repository.Model, "count")
      .withArgs({username: new RegExp('user@email.com', 'i')})
      .returns(Promise.resolve(1));

    let result = await repository.exists('user@email.com');

    repository.Model.count.restore();

    expect(result).to.equal(true);
  });

  it('should check if a user exists and return false if it doesnt', async () => {
    sinon.stub(repository.Model, "count")
      .withArgs({username: new RegExp('user@email.com', 'i')})
      .returns(Promise.resolve(0));

    let result = await repository.exists('user@email.com');

    repository.Model.count.restore();

    expect(result).to.equal(false);
  });

  it('should get a user with all fields by username', async () => {
    sinon.stub(repository.Model, 'findOne')
      .withArgs({username: new RegExp('user@email.com', 'i')}, ['firstName', 'lastName', 'username', 'email', 'password', 'roles'])
      .returns(Promise.resolve({
        firstName: 'Some',
        lastName: 'User',
        username: 'user@email.com',
        email: 'user@email.com',
        password: 'p455w0rd',
        roles: ['chef']
      }));

    let result = await repository.getByUsername('user@email.com');

    repository.Model.findOne.restore();

    expect(result).to.deep.equal({
      firstName: 'Some',
      lastName: 'User',
      username: 'user@email.com',
      email: 'user@email.com',
      password: 'p455w0rd',
      roles: ['chef']
    });
  });

  it('should try to get a user by username and throw an UserNotFoundException if the user is not found', done => {
    sinon.stub(repository.Model, 'findOne')
      .withArgs({username: new RegExp('notexistent@email.com', 'i')}, ['firstName', 'lastName', 'username', 'email', 'password', 'roles'])
      .returns(Promise.resolve(null));

    repository.getByUsername('notexistent@email.com')
      .catch(error => {
        expect(error.name).to.equal(UserNotFoundException.Name);
        expect(error.username).to.equal('notexistent@email.com');
        repository.Model.findOne.restore();
        done();
      });
  });

});