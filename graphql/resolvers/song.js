const Song = require("../../model/Song/Song_Schema");
const lodash = require('lodash');
const fs = require('fs');
// Query

// Mutation
async function addSong(_, { song_input }, context) {
  try {
    if (context.user_type === 'Administrator', 'Creator')
    {
      const created_by = context.user_id;
      return await Song.create({ ...song_input, created_by});
    } throw new Error('Its Only administrator or Creator for add some song');
  } catch (err) {
    console.log(err);
    throw err;
  }
}

//Loader
async function created_by(parent, args, context) {
  if (parent.created_by) {
    return await context.loaders.UserLoader.load(parent.created_by)
  }
  return null;
}

module.exports = {
  Mutation: {
    addSong,
  },
  Query: {
    song: (_, { ID }) => Song.findById(ID),
  },
};
