import logger from '../../src/utils/logger';

describe('logger', () => {

  it('should have the common logs methods', (done) => {
    expect(typeof logger['debug']).to.equal('function');
    expect(typeof logger['info']).to.equal('function');
    expect(typeof logger['warn']).to.equal('function');
    expect(typeof logger['error']).to.equal('function');
    done();
  })
});