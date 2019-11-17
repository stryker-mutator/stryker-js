module.exports = function (config) {	
    var typescript = true;
    if (typescript) {	
     config.set({	
      //  files: [	
      //    'node_modules/stryker-api/*.@(js|map)',	
      //    'node_modules/stryker-api/src/**/*.@(js|map)',	
      //    'package.json',	
      //    'src/**/*.ts',	
      //    '!src/**/*.d.ts',	
      //    'test/helpers/**/*.ts',	
      //    'test/unit/**/*.ts',	
      //    '!test/**/*.d.ts'	
      //  ],	
       symlinkNodeModules: true,	
       mutate: ['src/**/*.ts'],	
       coverageAnalysis: 'perTest',	
       tsconfigFile: 'tsconfig.stryker.json',	
       mutator: 'typescript',	
       transpilers: [	
         'typescript'	
       ],	
       mochaOptions: {	
         spec: ['test/helpers/**/*.js', 'test/unit/**/*.js']	
       }	
     })	
   } else {	
     config.set({	
       files: [	
         'test/helpers/**/*.js',	
         'test/unit/**/*.js',	
         { pattern: 'src/**/*.js', included: false, mutated: true },	
         { pattern: 'node_modules/stryker-api/*.js', included: false, mutated: false },	
         { pattern: 'node_modules/stryker-api/src/**/*.js', included: false, mutated: false }	
       ],	
       coverageAnalysis: 'perTest',	
       mutator: 'javascript'
     });	
   }	
    config.set({	
     testFramework: 'mocha',	
     testRunner: 'mocha',	
     reporters: ['progress', 'html', 'clear-text', 'event-recorder', 'dashboard'],	
     maxConcurrentTestRunners: 4,	
     thresholds: {	
       high: 80,	
       low: 60,	
       break: null	
     },	
     fileLogLevel: 'trace',	
     logLevel: 'info',	
     plugins: [	
       require.resolve('../mocha-runner/src/index'),	
       require.resolve('../mocha-framework/src/index'),	
       require.resolve('../html-reporter/src/index'),	
       require.resolve('../typescript/src/index'),	
       require.resolve('../javascript-mutator/src/index')	
     ],
     dashboard: {
      project: process.env.GITHUB_REPOSITORY,
      version: process.env.GITHUB_REF.substr(11),
      module: 'core',
      reportType: 'full'
     }
   });	
 };
