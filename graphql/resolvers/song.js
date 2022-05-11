const Song = require("../../model/Song/Song_Schema");

async function addSong(_, { songInput: { name, genre, duration, user_id } }) {
  try {
    const newSong = new Song({
      name: name,
      genre: genre,
      duration: duration,
      created_by: user_id,
    });
    const res = await newSong.save();
    return {
      id: res.id,
      ...res._doc,
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  Mutation: {
    addSong,
  },
  Query: {
    song: (_, { ID }) => Song.findById(ID),
  },
};
