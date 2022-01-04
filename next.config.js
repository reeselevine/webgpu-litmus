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
    assetPrefix: '/webgpu-mem-testing',
    basePath: '/webgpu-mem-testing',
    trailingSlash: true,
    ...loader
  }
}
