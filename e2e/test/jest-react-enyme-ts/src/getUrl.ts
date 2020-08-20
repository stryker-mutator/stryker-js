const uri = 'test';

export default (environment: 'dev' | 'stage') => {
  switch (environment) {
    case 'dev':
      return `https://localhost/${uri}`;
    case 'stage':
      return `https://stage.localhost/${uri}`;
  }
};
