const ParentBinLinker = require('link-parent-bin').ParentBinLinker;
const linker = new ParentBinLinker({ childDirectoryRoot: 'packages', linkDevDependencies: true, linkDependencies: false });
linker.linkBinsToChildren()
    .then(() => console.log('done'))
    .catch(err => console.error('Error Linking packages', err));