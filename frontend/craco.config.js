/* eslint-disable no-param-reassign */
// Suppress source-map-loader warnings from dependencies (e.g. react-zoom-pan-pinch)
// that ship broken or missing source map references.
module.exports = {
  webpack: {
    configure: (config) => {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        { message: /Failed to parse source map/ },
      ];
      return config;
    },
  },
};
