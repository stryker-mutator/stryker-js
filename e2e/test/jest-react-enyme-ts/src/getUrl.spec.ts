import getUrl from './getUrl';

describe('getUrl', () => {
  it('should return https://localhost/test for dev', () => {
    expect(getUrl('dev')).toEqual('https://localhost/test');
  });

  it('should return https://stage.localhost/test for dev', () => {
    expect(getUrl('stage')).toEqual('https://stage.localhost/test');
  });
});
