module.exports = {
  "require": ["dist/test/setup.js"],
  "timeout": 30000,
  "forbidOnly": Boolean(process.env.CI)
}
