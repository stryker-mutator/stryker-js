const {parser, env, extends: extend, rules, plugins, overrides} = require('../.eslintrc.cjs')
module.exports = {
  root: true,
  env,
  parserOptions: {
    sourceType: 'module',
    project: [require.resolve('./tsconfig.json')],
  },
  parser,
  extends: extend,
  plugins,
  rules,
  overrides,
};
