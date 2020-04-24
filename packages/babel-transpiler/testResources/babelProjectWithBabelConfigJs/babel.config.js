module.exports = (api) => {
  api.cache.forever();

  return {
    presets: ["@babel/preset-typescript"]
  }
}
