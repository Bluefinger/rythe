/* eslint-env node */
module.exports = function(api) {
  api.cache(true);

  return {
    presets: [
      [
        "@babel/env",
        {
          include: [],
          forceAllTransforms: false,
          modules: false,
          loose: true,
          targets: {
            ie: "11"
          },
          debug: false
        }
      ]
    ],
    plugins: ["@babel/plugin-syntax-dynamic-import"]
  };
};
