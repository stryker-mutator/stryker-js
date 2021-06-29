const { When } = require('@cucumber/cucumber');

When('i set the clock 2001ms further in the future', () => {
  global.sinonClock.tick(2001);
});
