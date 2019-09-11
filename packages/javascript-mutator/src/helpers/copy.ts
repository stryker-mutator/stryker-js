import * as _ from 'lodash';

export default <T>(obj: T, deep?: boolean) => {
  if (deep) {
    return _.cloneDeep(obj);
  }

  return _.clone(obj);
};
