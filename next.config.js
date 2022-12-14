module.exports = {
    assetPrefix: process.env.ASSET_PREFIX,
    basePath: process.env.BASE_PATH,
    env: {
      corsAllow: process.env.CORS_ALLOW,
        dataApi: process.env.DATA_API
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      config.module.rules.push({
        test: /\.wgsl$/i,
        loader: "raw-loader",
      });
      config.experiments = { ...config.experiments, ...{ topLevelAwait: true }};
      return config;
    }
}