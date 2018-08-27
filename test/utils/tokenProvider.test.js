import * as jwt from '../../src/utils/tokenProvider';
import * as utilities from '../../src/utils/utilities';
import {InvalidTokenException} from "../../src/utils/exceptions";

describe('TokenProvider', () => {

  before(done => {

    done();
  });

  after(() => {

  });

  it('should return a valid JWT', async () => {
    sinon.stub(utilities, 'getUTCNow').returns(1000);

    let token = await jwt.createToken({
      firstName: 'Andres',
      lastName: 'Blanco',
      email: 'andres@email.com',
      roles: ['chef'],
    }, {
      tokenTtl: 60
    });

    utilities.getUTCNow.restore();

    expect(token).to.equal('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdE5hbWUiOiJBbmRyZXMiLCJsYXN0TmFtZSI6IkJsYW5jbyIsImVtYWlsIjoiYW5kcmVzQGVtYWlsLmNvbSIsInJvbGVzIjpbImNoZWYiXSwiaWF0IjoxMDAwLCJleHAiOjEwNjAsImlzcyI6Imd1c3RlYXUifQ.JALUUGqLvikwElSAlFgP1JzY73qJP4g_M8VItJDR1xc');
  });

  it('should validate a token', async () => {
    sinon.stub(utilities, 'getUTCNow').returns(1000);

    let payload = await jwt.verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdE5hbWUiOiJBbmRyZXMiLCJsYXN0TmFtZSI6IkJsYW5jbyIsImVtYWlsIjoiYW5kcmVzQGVtYWlsLmNvbSIsInJvbGVzIjpbImNoZWYiXSwiaWF0IjoxMDAwLCJleHAiOjEwNjAsImlzcyI6Imd1c3RlYXUifQ.JALUUGqLvikwElSAlFgP1JzY73qJP4g_M8VItJDR1xc');

    utilities.getUTCNow.restore();

    expect(payload).to.deep.equal({
      email: 'andres@email.com',
      exp: 1060,
      firstName: 'Andres',
      iat: 1000,
      iss: 'gusteau',
      lastName: 'Blanco',
      roles: [
        'chef'
      ]
    });
  });

  it('should try to validate an expired token', (done) => {
    sinon.stub(utilities, 'getUTCNow').returns(2000);

    jwt.verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdE5hbWUiOiJBbmRyZXMiLCJsYXN0TmFtZSI6IkJsYW5jbyIsImVtYWlsIjoiYW5kcmVzQGVtYWlsLmNvbSIsInJvbGVzIjpbImNoZWYiXSwiaWF0IjoxMDAwLCJleHAiOjEwNjAsImlzcyI6Imd1c3RlYXUifQ.JALUUGqLvikwElSAlFgP1JzY73qJP4g_M8VItJDR1xc')
      .catch(error => {
        expect(error.name).to.equal(InvalidTokenException.Name);
        done();
      })
  })
});