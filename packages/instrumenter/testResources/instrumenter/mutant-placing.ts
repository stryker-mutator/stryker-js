// @ts-nocheck

// https://github.com/stryker-mutator/stryker-js/issues/3702
directoryFiles[file[0].substr(1)] = file[1]

// https://github.com/stryker-mutator/stryker-js/issues/4884
initialNodes.filter((n) => n.id === 'tiptilt')[0].className = tiptiltState;

