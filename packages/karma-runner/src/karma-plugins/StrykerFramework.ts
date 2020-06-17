export function strykerFrameworkFactory(files: string[]) {
  const frameworkAdapterPath = require.resolve('./StrykerFrameworkAdapter');
  files.unshift(frameworkAdapterPath);
}
strykerFrameworkFactory.$inject = ['config.files'];
