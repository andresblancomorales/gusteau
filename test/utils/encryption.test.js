import * as crypto from '../../src/utils/cryptography';

describe('Cryptography', () => {

  it('must generate random different hashes every time', async () => {
    let salt1 = await crypto.generateSalt();
    let salt2 = await crypto.generateSalt();

    expect(salt1).to.not.be.undefined;
    expect(salt2).to.not.be.undefined;
    expect(salt1).to.not.equal(salt2);

  });

  it('must hash a string', async () => {
    let salt1 = await crypto.generateSalt();
    let hash1 = await crypto.encryptText('password', salt1);

    let salt2 = await crypto.generateSalt();
    let hash2 = await crypto.encryptText('password', salt2);

    expect(hash1).to.not.be.undefined;
    expect(hash2).to.not.be.undefined;
    expect(hash1).to.not.equal(hash2);
  });

  it('must return true if a password is valid', async () => {
    let salt = await crypto.generateSalt();
    let hash = await crypto.encryptText('password', salt);

    let isValid = await crypto.isPasswordValid('password', hash);

    expect(isValid).to.be.true;
  });

  it('must return false if a password is invalid', async () => {
    let salt = await crypto.generateSalt();
    let hash = await crypto.encryptText('password', salt);

    let isValid = await crypto.isPasswordValid('b4d', hash);

    expect(isValid).to.be.false;
  });
});