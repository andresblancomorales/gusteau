import * as ex from '../../src/utils/exceptions';

describe('Exceptions', () => {
  it('should transform a Mongoose ValidationError to our own', (done) => {
    let transformedError = ex.transform({name: 'ValidationError', errors: {field1: {}, field2: {}}});

    expect(transformedError.message).to.equal('Validation error found in fields: field1,field2');
    expect(transformedError.name).to.equal('ValidationException');
    expect(transformedError.fields).to.deep.equal(['field1', 'field2']);
    done();
  });
});