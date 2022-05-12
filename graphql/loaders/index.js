const { userLoader } = require('./user');
const { songsLoader } = require('./songs');

module.exports = {
    loaders: () => {
        return {
            userLoader: userLoader(),
            songLoader: songsLoader(),
        }
    }
}