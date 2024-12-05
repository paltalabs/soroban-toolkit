const copy = require("rollup-plugin-copy");

module.exports = {
  rollup(config, options) {
    config.plugins = [
      ...config.plugins,
      copy({
        targets: [{ src: "src/**/*.wasm", dest: "dist" }],
        watch: options.env === "development", // Watches files during development mode
      }),
    ];
    return config;
  },
};