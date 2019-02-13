<!---
Thanks for filing an issue 😄 ! Before you submit, please read the following:

Search open/closed issues before submitting since someone might have asked the same thing before!

If you are having trouble running stryker, please fill in the template below.
If you have a feature request, feel free to ignore the template.
-->

### Summary

<!--- Provide a general summary of the issue in the title above -->

### Stryker config

<!--- Please place your stryker config below. Feel free to change paths in the files and mutate arrays if you cannot share them. -->

```js
module.exports = function(config){
  config.set({
    ....
  });
}
```

### Stryker environment

<!-- Please list your stryker plugins + versions here (output of `npm ls | grep stryker`) -->

```
+-- @stryker-mutator/core@x.x.x
+-- @stryker-mutator/xxx-xxx@x.x.x
```

<!-- Please also add the test runner you are using.  Examples:-->

```
+-- mocha@x.x.x
+-- jest@x.x.x
+-- karma@x.x.x
+-- angular-cli@x.x.x
+-- react-scripts@x.x.x
```

### Test runner environment

<!-- Please add your test command here (probably the command you use in `npm test`) command -->

```
# Test command

```

<!-- Please add any config files that are used by your test runner. For example jest.config.js, karma.conf.js, angular.json, mocha.opts, ...  -->

```json
```


### Your Environment

| software         | version(s)
| ---------------- | -------  
| node             | 
| npm              | 
| Operating System | 

### Add stryker.log

<!-- Please add your stryker.log file. This file can be generated using `stryker run --fileLogLevel trace`. You can drag and drop it here. -->
<!-- Your source code is never logged to this file, however file names are logged. Feel free to obfuscate those log messages if you think it is a problem -->
