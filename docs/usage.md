---
title: Usage
custom_edit_url: https://github.com/stryker-mutator/stryker/edit/master/docs/usage.md
---
  
```sh
npx stryker <command> [options] [configFile]
```

The main `command` for Stryker is `run`, which kicks off mutation testing.

By default, Stryker will look for a `stryker.conf.js` or `stryker.conf.json` file in the current working directory (if it exists). This can be overridden by specifying a different file as the last argument.

Before your first run, we recommend you try the `init` command, which helps you to set up this config file and install any missing packages needed for your specific configuration. We recommend you verify the contents of the configuration file after this initialization, to make sure everything is setup correctly. Of course, you can still make changes to it, before you run Stryker for the first time.

If your project uses Typescript and you have tests which specifically run against those Typescript files, you may need to prepend your command with `TS_NODE_PROJECT=path/to/your/tsconfig.json`.
