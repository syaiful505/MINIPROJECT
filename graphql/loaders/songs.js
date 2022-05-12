const Song = require('../../model/Song/Song_Schema');
const DataLoader = require('dataloader');

const bacthSong = async (song_ids) => {
  const playlist = await Song.find({
    _id: { $in: song_ids },
  });

  const dataMap = new Map();
  playlist.forEach((el) => {
    dataMap.set(el._id.toString(), el);
  });

  return song_ids.map((id) => dataMap.get(id.toString()));
};
exports.SongsLoader = () => new DataLoader(bacthSong);
