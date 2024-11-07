# egg-cos
[![English][en-image]][en-url]

## 腾讯云cos存储在Egg.js框架插件 -Tencent COS(Cloud Object Storage) Egg.js Plugin


[![NPM version][npm-image]][npm-url]
[![Test coverage][codecov-image]][codecov-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[en-image]: https://img.shields.io/badge/English-blue.svg
[en-url]: https://github.com/onewalker/egg-cos/blob/cur-publish/README.md
[npm-image]: https://img.shields.io/npm/v/@onewalker/egg-cos.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@onewalker/egg-cos
[codecov-image]: https://img.shields.io/codecov/c/github/onewalker/egg-cos.svg?style=flat-square
[codecov-url]: https://codecov.io/github/onewalker/egg-cos?branch=cur-publish
[snyk-image]: https://snyk.io/test/npm/@onewalker/egg-cos/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/@onewalker/egg-cos
[download-image]: https://img.shields.io/npm/dm/@onewalker/egg-cos.svg?style=flat-square
[download-url]: https://www.npmjs.com/package/@onewalker/egg-cos

腾讯云cos存储在Egg.js框架插件 Tencent COS(Cloud Object Storage) Egg.js 插件

此插件将腾讯云对象存储（COS）集成到由阿里巴巴集团开发的 [Egg.js](https://eggjs.org/zh-cn/tutorials/index.html) 框架中。它支持两种文件上传方式：
- 文件块模式：适用于小文件，会占用服务器的空间
- 文件流模式：适合大文件，不会占用自己的后端服务器空间,服务器友好

最初，我尝试将流模式功能贡献给另一个项目，但未收到项目所有者的回复。因此，我决定将此插件发布给社区。

## 安装

```bash
npm install @onewalker/egg-cos
```

## 配置

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

在 egg agent 中初始化，默认值为 `false`：

```js
exports.cos = {
  useAgent: true
};
```

## 使用

你可以在 `app` 或 `ctx` 上获取腾讯云 cos 实例。
// 在控制器中上传文件

- 文件模式：文件在处理过程中会暂时存储在服务器中；

```js
const path = require('path');
const Controller = require('egg').Controller;

module.exports = class extends Controller {
  async upload() {
    const ctx = this.ctx;
    // 请启用 `egg-multipart` 的 `file` 模式。
    const file = ctx.request.files[0];
    const name = 'egg-cos/' + path.basename(file.filename);
    let result;
    try {
      result = await ctx.cos.put(name, file.filepath);
    } finally {
      // 需要删除临时文件
      await ctx.cleanupRequestFiles();
    }

    if (result) {
      ctx.logger.info('cos response:\n', result);
      ctx.body = {
        url: `https://${result.Location}`
      };
    } else {
      ctx.body = '请选择一个文件上传！';
    }
  }
};
```
- 流模式上传：文件直接传输到云服务器，不经过你的服务器；

```js
const Controller = require('egg').Controller;
const sendToWormhole = require('stream-wormhole');
async upload() {
  const ctx = this.ctx;
  const parts = ctx.multipart();
  let part, results = [];
  while ((part = await parts()) != null) {
    if (part.length) {
      // 这是 part 流的内容
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
      console.log("part", part.stream, typeof part);
      // 文件处理，将文件上传到腾讯云服务器
      let result;
      let path = await ctx.helper.MD5encode(String(Date.now()));
      let typeArray = part.mime.split('/');
      let type = typeArray[typeArray.length - 1];
      let name = 'ysxbdms/projects/' + path + `.${type}`; // 上传链接
      try {
        result = await ctx.cos.putStream(name, part);
      } catch (err) {
        await sendToWormhole(part);
        throw err;
      }
      console.log(result);
      results.push(result);
    }
  }
  console.log('表单解析完成！');
  ctx.body = results;
};
```

## 问题与建议

请在 [这里](https://github.com/onewalker/egg-cos/issues) 提交问题。

## 许可证

[MIT](LICENSE)
