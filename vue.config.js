const path = require('path');
const resolve = (dir) => path.join(__dirname, dir);

module.exports = {
  // outputDir: process.env.outputDir || 'dist', // 'dist', 生产环境构建文件的目录
  outputDir: 'dist',

  // assetsDir: "", // 相对于outputDir的静态资源(js、css、img、fonts)目录

  chainWebpack: (config) => {
    // 添加别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@api', resolve('src/api'))
      .set('@assets', resolve('src/assets'))
      .set('@components', resolve('src/components'))
      .set('@router', resolve('src/router'))
      .set('@store', resolve('src/store'))
      .set('@utils', resolve('src/utils'))
      .set('@views', resolve('src/views'))
    return config;
  },
  // 开发环境开启eslint，测试和线上编辑代码禁止eslint
  lintOnSave: false,

  // 是否使用包含运行时编译器的 Vue 构建版本
  runtimeCompiler: true,

  // 生产环境的 source map
  productionSourceMap: false,

};
