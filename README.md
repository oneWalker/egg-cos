# egg-cos

[![NPM version][npm-image]][npm-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

<!--
Description here.
-->

## Install

```bash

```

## Configuration

```js
// {app_root}/config/plugin.js
exports.cos = {
  enable: true,
  package: 'egg-cos'
};
```

```js
// {app_root}/config/config.default.js
exports.cos = {
  client: {
    SecretId: '',
    SecretKey: '',
    Bucket: '',
    Region: ''
  }
};
```

Init in egg agent, default is `false`:

```js
exports.cos = {
  useAgent: true
};
```

## Usage

You can aquire tencent cloud cos instance on `app` or `ctx`.

```js

// upload a file in controller
// 1.File Mode：The file is temporarily stored as cache in your server during the process;
const path = require('path');
const Controller = require('egg').Controller;

module.exports = class extends Controller {
  async upload() {
    const ctx = this.ctx;
    // please enable `file` mode of `egg-multipart`.
    const file = ctx.request.files[0];
    const name = 'egg-cos/' + path.basename(file.filename);
    let result;
    try {
      result = await ctx.cos.put(name, file.filepath);
    } finally {
      // need to remove the tmp files
      await ctx.cleanupRequestFiles();
    }

    if (result) {
      ctx.logger.info('cos response:\n', result);
      ctx.body = {
        url: `https://${result.Location}`
      };
    } else {
      ctx.body = 'please select a file to upload！';
    }
  }
};

// upload a file in controller
// 2.upload by Stream：The file is transfered to cloud server directly, not go through your server;
const Controller = require('egg').Controller;
const sendToWormhole = require('stream-wormhole');
async upload() {
  const ctx = this.ctx;
  const parts = ctx.multipart();
  let part,results=[];
  while ((part = await parts()) != null) {
      if (part.length) {
          // This is content of part stream
          console.log('field: ' + part[0]);
          console.log('value: ' + part[1]);
          console.log('valueTruncated: ' + part[2]);
          console.log('fieldnameTruncated: ' + part[3]);
      } else {
          if (!part.filename) {
              return;
          }
          console.log('field: ' + part.fieldname);
          console.log('filename: ' + part.filename);
          console.log('encoding: ' + part.encoding);
          console.log('mime: ' + part.mime);
          console.log("part",part.stream,typeof part);
          // file processing, uploading the file to Tencent Cloud Server
          let result;
          let path=await ctx.helper.MD5encode(String(Date.now()));
          let typeArray=part.mime.split('/');
          let type=typeArray[typeArray.length-1];
          let name='ysxbdms/projects/'+path+`.${type}`;
          try {
              result = await ctx.cos.putStream(name,part);
          } catch (err) {
              await sendToWormhole(part);
              throw err;
          }
          console.log(result);
          results.push(result);
      }
  }
  console.log('and we are done parsing the form!');
  ctx.body=results;
};
```



## Questions & Suggestions

Please open an issue [here](https://github.com/shuang6/egg-cos/issues).

## License

[MIT](LICENSE)
