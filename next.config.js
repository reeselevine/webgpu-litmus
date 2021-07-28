const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase, { defaultConfig }) => {
  const loader = {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      config.module.rules.push({
        test: /\.wgsl$/i,
        loader: "raw-loader",
      });

      return config;
    }
  };

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      ...loader
    }
  }

  return {
    assetPrefix: '/~reeselevine/webgpu/',
    basePath: '/~reeselevine/webgpu',
    trailingSlash: true,
    ...loader
  }
}