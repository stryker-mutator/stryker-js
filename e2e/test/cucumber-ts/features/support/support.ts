import { defineParameterType } from '@cucumber/cucumber';

defineParameterType({
  name: 'boolean',
  regexp: /true|false/,
  transformer(val) {
    return val === 'true';
  }
})
