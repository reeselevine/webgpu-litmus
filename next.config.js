module.exports = {
    assetPrefix: process.env.ASSET_PREFIX,
    basePath: process.env.BASE_PATH,
    trailingSlash: true,
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      config.module.rules.push({
        test: /\.wgsl$/i,
        loader: "raw-loader",
      });
      return config;
    }
}