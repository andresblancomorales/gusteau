import {isDefined} from "../../src/utils/utilities";

describe('Utilities', () => {
  it('should validate correctly if something is not undefined', (done) => {
    expect(isDefined({})).to.be.true
    done();
  });

  it('should validate correctly if something is undefined', (done) => {
    expect(isDefined(undefined)).to.be.false
    done();
  });
});