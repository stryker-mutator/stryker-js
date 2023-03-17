const { When } = require('@cucumber/cucumber');

When('i sleep for 200ms', async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));
});
