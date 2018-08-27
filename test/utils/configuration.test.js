import Configuration from '../../src/utils/configuration';

describe('Configuration', () => {

  it('should get the configured values', (done) => {
    expect(Configuration.DB_HOST).to.equal('test_host');
    expect(Configuration.DB_PORT).to.equal('9999');
    expect(Configuration.DB_NAME).to.equal('test');
    expect(Configuration.SERVICE_PORT).to.equal('9000');
    expect(Configuration.LOG_FILE).to.be.undefined;
    expect(Configuration.LOG_LEVEL).to.equal('debug');
    expect(Configuration.JWT_SECRET).to.equal('53cr37');
    expect(Configuration.JWT_ISSUER).to.equal('gusteau');

    done();
  });
});