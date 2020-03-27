(function (window) {
      jasmine.getEnv().specFilter = function (spec) {
          return ["outer test 3"].indexOf(spec.getFullName()) !== -1;
      }})(global);