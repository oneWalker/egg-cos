# egg-cos

[![NPM version][npm-image]][npm-url]
[![Test coverage][codecov-image]][codecov-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@onewalker/egg-cos.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@onewalker/egg-cos
[codecov-image]: https://img.shields.io/codecov/c/github/onewalker/egg-cos.svg?style=flat-square
[codecov-url]: https://codecov.io/github/onewalker/egg-cos?branch=cur-publish
[snyk-image]: https://snyk.io/test/npm/@onewalker/egg-cos/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/@onewalker/egg-cos
[download-image]: https://img.shields.io/npm/dm/@onewalker/egg-cos.svg?style=flat-square
[download-url]: https://www.npmjs.com/package/@onewalker/egg-cos

腾讯云存储在Egg.js框架插件 Tencent COS(Cloud Object Storage) Egg.js Plugin

This plugin integrates Tencent Cloud Object Storage (COS) with the [Egg.js](https://eggjs.org/en/tutorials/index.html) framework, a Node.js framework developed by Alibaba Group. It supports two methods for file uploads: file mode and stream mode.

Initially, I attempted to contribute the stream mode functionality to another project, but did not receive a response from the owner. Therefore, I decided to release this plugin to the community.

## Install

```bash

  npm install @onewalker/egg-cos

```

## Configuration

```js
// {app_root}/config/plugin.js
exports.cos = {
  enable: true,
  package: '@onewalker/egg-cos'
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
// upload a file in controller

- File Mode：The file is temporarily stored as cache in your server during the process;

```js
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
```
- upload by Stream：The file is transfered to cloud server directly, not go through your server;

```js
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
       let name='ysxbdms/projects/'+path+`.${type}`;//the upload links
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

Please open an issue [here](https://github.com/onewalker/egg-cos/issues).

## License

[MIT](LICENSE)

