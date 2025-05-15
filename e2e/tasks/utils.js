/**
 * @typedef Package
 * @property {string[]} [os]
 */

/**
 * @param {Package} pkg
 * @returns {boolean}
 */
export function satisfiesPlatform(pkg) {
  /** @type {undefined|string[]} */
  const supportedPlatforms = pkg.os;
  if (supportedPlatforms && !supportedPlatforms.includes(process.platform)) {
    console.log(
      `(current platform "${process.platform}" did not satisfy ${supportedPlatforms.map((platform) => `"${platform}"`).join(',')})`,
    );
    return false;
  } else {
    return true;
  }
}
