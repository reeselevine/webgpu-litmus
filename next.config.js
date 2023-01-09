module.exports = {
    assetPrefix: process.env.ASSET_PREFIX,
    basePath: process.env.BASE_PATH,
    env: {
        dataApi: process.env.DATA_API,
        dbPath: process.env.DB_PATH
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      config.module.rules.push({
        test: /\.wgsl$/i,
        loader: "raw-loader",
      });
      return config;
    }
}