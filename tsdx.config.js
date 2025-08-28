const copy = require("rollup-plugin-copy");

module.exports = {
  rollup(config, options) {
    // Add the copy plugin
    config.plugins.push(
      copy({
        targets: [{ src: "src/**/*.wasm", dest: "dist" }],
        watch: options.env === "development", // Watches files during development mode
      })
    );
    
    return config;
  },
};