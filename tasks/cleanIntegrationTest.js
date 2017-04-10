const rimraf = require('rimraf');

const paths = ['integrationTest/*/node_modules/stryker*', 'integrationTest/*/!(stryker.conf).js', 'integrationTest/*/*+(.d.ts|.map)', 'integrationTest/+(*.d.ts|*.js|*.map)'];
paths.forEach(path => {
    rimraf(path,   
        (err) => {
            if(err) {
                console.err('Integration test clean gave an error', err);
                process.exit(1);
            }
    });
});
