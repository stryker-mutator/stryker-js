import * as jest from 'jest';

function isJestV24(jestPackage: any) {
  if (typeof jestPackage.runCLI === 'function') {
    return jestPackage;
  } else {
    return jestPackage.default;
  }
}

export default isJestV24(jest);
