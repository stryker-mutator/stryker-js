import {Server, ConfigOptions} from 'karma';

process.on('message', function(config: ConfigOptions) {
  var server = new Server(config, function(exitCode) {
    process.exit(1);
  });
  var startTime = 0;
  var endTime = 0;

  server.on('browsers_ready', function() {
    startTime = Date.now();
  });
  server.on('run_complete', function(browsers, results) {
    endTime = Date.now();
    results.timeSpent = endTime - startTime;
    process.send(results);
  });

  server.start();
});
