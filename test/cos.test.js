'use strict';

const mock = require('egg-mock');

describe('test/cos.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/cos-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, cos')
      .expect(200);
  });

  it('should upload a file to COS', async () => {
  });

  it('should upload a stream to COS', async () => {
  });

  it('should fail to upload a file with invalid credentials', async () => {
  });
});
