import { bootstrapLocalDependencies } from '../../helpers/bootstrap-local-dependencies';
import path from 'path';

bootstrapLocalDependencies(path.resolve(__dirname, '..'))
  .then(() => console.log('Installed local dependencies'))
  .catch(err => console.error(err));
