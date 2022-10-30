module.exports = {
  "require": "dist/test/setup.js",
  "timeout": 10000,
  "forbidOnly": Boolean(process.env.CI)
}
