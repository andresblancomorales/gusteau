import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export function generateSalt() {
  return bcrypt.genSalt(SALT_ROUNDS);
}

export function encryptText(text, salt) {
  return bcrypt.hash(text, salt)
}

export function isPasswordValid(password, hash) {
  return bcrypt.compare(password, hash);
}