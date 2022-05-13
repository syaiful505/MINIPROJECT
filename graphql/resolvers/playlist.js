const playlist = require("../../model/Playlist/Playlist_Schema");
const lodash = require("lodash");
const fs = require("fs");

// Loader
async function created_by(parent, args, context) {
  if (parent.created_by) {
    return await context.loaders.UserLoader.load(parent.created_by);
  }
  return null;
}

async function song_ids(parent, args, context) {
  if (parent.song_ids) {
    return await context.loaders.SongsLoader.loadMany(parent.song_ids);
  }
  return null;
}
async function collaborator_ids(parent, args, context) {
  if (parent.collaborator_ids) {
    return await context.loaders.UserLoader.loadMany(parent.collaborator_ids);
  }
  return null;
}

//Query
//Mutation

module.exports = {
  Query: {},
  Mutation: {},
  Playlist: {
    song_ids,
    collaborator_ids,
    created_by,
  },
};
