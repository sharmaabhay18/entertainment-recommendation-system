const movieApi = require('./movieApi');
const baseConfig = require('../config/appSettings.json');

const api = {
  searchApi: (value) => `${baseConfig.BASE_MOVIE_API}${movieApi.search}api_key=${baseConfig.API_KEY}&query=${value}`,
  imageApi: (imageLink) => `${baseConfig.IMG_API}${imageLink}`,
  getMovie: (id) => `${baseConfig.BASE_MOVIE_API}${movieApi.movie}${id}?api_key=${baseConfig.API_KEY}&language=en-US`,
};

module.exports = api;
