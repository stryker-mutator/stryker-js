import cloneDeep = require('lodash.clonedeep');

export default <T>(obj: T, deep?: boolean) => (deep ? cloneDeep(obj) : { ...obj });
