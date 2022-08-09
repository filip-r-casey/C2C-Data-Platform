const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      "^/api": {
        target: "http://0.0.0.0:3000",
        changeOrigin: true,
      },
    },
  },
});
