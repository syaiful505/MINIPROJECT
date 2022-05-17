const playlist = require("../../model/Playlist/Playlist_Schema");
const { ApolloError } = require("apollo-server-errors");
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
async function getAllPlaylist(_, { filter, sorting }) {
  try {
    const query = {
      $and: [{}],
    };
    const aggregateQuery = [{ $match: query }];
    if (filter) {
      if (filter.playlist_name) {
        query.$and.push({
          playlist_name: { $regex: new RegExp(filter.playlist_name, 'i') },
        });
      }
      if (filter.creator_name) {
        aggregateQuery.push(
          {
            $lookup: {
              from: 'users',
              localField: 'created_by',
              foreignField: '_id',
              as: 'creator_name',
            },
          },
          {
            $match: {
              'creator_name.name': {
                $regex: new RegExp(filter.creator_name, 'i'),
              },
            },
          }
        );
      }
      if (filter.song_name) {
        aggregateQuery.push(
          {
            $lookup: {
              from: 'users',
              localField: 'created_by',
              foreignField: '_id',
              as: 'song_name',
            },
          },
          {
            $match: {
              'song_name.name': {
                $regex: new RegExp(filter.song_name, 'i'),
              },
            },
          }
        );
      }
    }
  
    if (sorting) {
      let sort = {};
  
      if (sorting.creator_name) {
        aggregateQuery.push(
          {
            $lookup: {
              from: 'users',
              localField: 'created_by',
              foreignField: '_id',
              as: 'creator_name',
            },
          },
          {
            $set: {
              creator_name_lower: {
                $toLower: {
                  $arrayElemAt: ['$creator_name.name', 0],
                },
              },
            },
          }
        );
        sort.creator_name_lower = sorting.creator_name === 'asc' ? 1 : -1;
      } else if (sorting.playlist_name) {
        sort.playlist_name = sorting.playlist_name === 'asc' ? 1 : -1;
      }
      aggregateQuery.push({
        $sort: loadash.isEmpty(sort) ? { createdAt: -1 } : sort,
      });
    }
    return await Playlist.aggregate(aggregateQuery);
  } catch (err) {
    console.log(err);
    throw err;
  }
}
//Mutation
async function createPlaylist(_, { playlist_input }, context) {
  try {
    if (context.user_type === 'Creator') {
      const created_by = context.user_id;
      return await Playlist.create({ ...playlist_input, created_by})
    }
    throw new Error('Only Creator can create Playlist')
  } catch (err) {
    console.log(err);
    throw err;
  }
}
async function addSongToPlaylist(_, { _id, song_ids }, context) {
  try {
    const check = await Playlist.findOne({
      $or: [{ created_by: context.user_id }, { collaboratpr_ids: context.user_id }],
    });
    if (check) {
      const playlist = await Playlist.findByIdAndUpdate(
        { _id },
        { $push: { song_ids }},
        {
          new: true,
        }
      );
      return playlist;
    }
    throw new Error('Creator / Collaborator can add song to Playlist ');
  } catch (err){
  console.log(err);
  throw err;
  } 
}
async function addCollab(_, {_id, collaborator_ids, created_by})
{
  try {
    const collab = await Playlist.findOne({ _id, created_by: created_by });
    if (collab) {
      const playlist = await Playlist.findByIdAndUpdate(
        _id,
        { $push: { collaborator_ids }},
        {
          new: true,
        }
      );
      return playlist;
    } else (!collab) {
      throw new Error('Creator can add and remove collaborator to playlist');
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}
async function getOnePlaylist(_, { _id }) {
  return await Playlist.findById(_id);
}
async function deleteSongPlaylist(_, { _id, song_ids }, context){
  try {
    const check = await Playlist.findOne({
      created_by: context.user_id,
    });
    if (check) {
      const playlist = await Playlist.findByIdAndUpdate(
        { _id },
        {
          $pull: { song_ids: { $in: song_ids } },
        },
        { new: true }
      );
      return playlist;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}
async function deleteCollabPlaylist(_, { _id, collabrator_ids, created_by }, context)
{
  try {
    const collab = await Playlist.findOne({ created_by: created_by });
  if (collab) {
    const playlist = await Playlist.findByIdAndUpdate(
      _id,
      { $pull: { collaborator_ids: { $in: collaborator_ids } } },
      { new: true }
    );
    return playlist;
  } else if (!collab) {
    throw new Error('Creator can add / remove collaborator to playlist');
  }
  } catch (err) {
    console.log(err);
    throw err;
  }
}
module.exports = {
  Query: {},
  Mutation: {},
  Playlist: {
    song_ids,
    collaborator_ids,
    created_by,
  },
};
