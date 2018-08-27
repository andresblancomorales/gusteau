export class ValidationException extends Error {
  constructor(fields) {
    super(`Validation error found in fields: ${fields.join(',')}`);
    this.name = ValidationException.Name;
    this.fields = fields;
  }
}
ValidationException.Name = 'ValidationException';

export class NotImplementedException extends Error {
  constructor(method) {
    super(`${method} not implemented`);
    this.name = NotImplementedException.Name;
    this.method = method;
  }
}
NotImplementedException.Name = 'NotImplementedException';

export class UserAlreadyExistsException extends Error {
  constructor(username) {
    super(`User ${username} already exists`);
    this.name = UserAlreadyExistsException.Name;
    this.username = username;
  }
}
UserAlreadyExistsException.Name = 'UserAlreadyExistsException';

export class UserNotFoundException extends Error {
  constructor(username) {
    super(`User ${username} was not found`);
    this.name = UserNotFoundException.Name;
    this.username = username;
  }
}
UserNotFoundException.Name = 'UserNotFoundException';

export class ClientNotFoundException extends Error {
  constructor(client) {
    super(`Client ${client} was not found`);
    this.name = ClientNotFoundException.Name;
    this.client = client;
  }
}
ClientNotFoundException.Name = 'ClientNotFoundException';

export class NotSupportedGrantTypeException extends Error {
  constructor(grantType) {
    super(`Grant type ${grantType} is not supported`);
    this.name = NotSupportedGrantTypeException.Name;
    this.grantType = grantType;
  }
}
NotSupportedGrantTypeException.Name = 'NotSupportedGrantTypeException';

export class AuthenticationException extends Error {
  constructor(username) {
    super(`Unable to authenticate user ${username}`);
    this.name = AuthenticationException.Name;
    this.username = username;
  }
}
AuthenticationException.Name = 'AuthenticationException';

export class InvalidTokenException extends Error {
  constructor() {
    super('Invalid token');
    this.name = InvalidTokenException.Name;
  }
}
InvalidTokenException.Name = 'InvalidTokenException';

export function transform(exception) {
  switch (exception.name) {
    case 'ValidationError':
      let fields = Object.keys(exception.errors);
      return new ValidationException(fields);
    case 'TokenExpiredError':
      return new InvalidTokenException();
  }

  return exception;
}