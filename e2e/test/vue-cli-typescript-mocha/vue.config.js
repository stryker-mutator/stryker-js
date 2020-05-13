module.exports  = {
  devServer: {
    before(app) {
      app.get('/api/pokemon', (_req, response) => {
        response.json([{
          name: 'Bulbasaur',
          type: 'grass'
        }, {
          name: 'Charmander',
          type: 'fire'
        }, {
          name: 'squirdle',
          type: 'water'
        }]);
      })
    }
  }

}
