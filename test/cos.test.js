'use strict';

const mock = require('egg-mock');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

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
    const ctx = app.mockContext();
    const cos = ctx.service.cos;
    const filePath = path.join(__dirname, 'fixtures/test.txt');
    fs.writeFileSync(filePath, 'Hello COS');
    const result = await cos.put('test/test.txt', filePath);
    assert(result);
    fs.unlinkSync(filePath);
  });

  it('should upload a stream to COS', async () => {
    const ctx = app.mockContext();
    const cos = ctx.service.cos;
    const filePath = path.join(__dirname, 'fixtures/test.txt');
    fs.writeFileSync(filePath, 'Hello COS');
    const stream = fs.createReadStream(filePath);
    const result = await cos.putStream('test/test-stream.txt', stream);
    assert(result);
    fs.unlinkSync(filePath);
  });

  it('should fail to upload a file with invalid credentials', async () => {
    const ctx = app.mockContext();
    const cos = new ctx.service.cos.constructor({
      SecretId: 'invalid',
      SecretKey: 'invalid',
      Bucket: 'invalid',
      Region: 'invalid',
    });
    const filePath = path.join(__dirname, 'fixtures/test.txt');
    fs.writeFileSync(filePath, 'Hello COS');
    try {
      await cos.put('test/test.txt', filePath);
    } catch (err) {
      assert(err);
    }
    fs.unlinkSync(filePath);
  });
});
