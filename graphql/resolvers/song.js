const Song = require("../../model/Song/Song_Schema");
const lodash = require("lodash");
const fs = require("fs");

//Loader
async function created_by(parent, args, context) {
  if (parent.created_by) {
    return await context.loaders.UserLoader.load(parent.created_by);
  }
  return null;
}
// Query
async function getAllSongs(_, { pagination, filter, sorting }) {
  try {
    // Save the aggregateQuery
    const query = { $and: [{}] };
    //create some aggregatequery and push
    const aggregateQuery = [{ $match: query }];
    if (filter) {
      if (filter.name) {
        query.$and.push({
          name: { $regex: new RegExp(filter.name, "i") },
        });
      }
      if (filter.genre) {
        query.$and.push({
          genre: { $regex: new RegExp(filter.genre, "i") },
        });
      }
      if (filter.creator_name) {
        aggregateQuery.push(
          {
            $lookup: {
              from: "users",
              localField: "created_by",
              foreignField: "_id",
              as: "creator_name",
            },
          },
          {
            $match: {
              "creator_name.name": {
                $regex: new RegExp(filter.creator_name, "i"),
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
              from: "users",
              localField: "created_by",
              foreignField: "_id",
              as: "creator_name",
            },
          },
          {
            $set: {
              creator_name_lower: {
                $toLower: { $arrayElemAt: ["$creator_name.name", 0] },
              },
            },
          }
        );
        sort.creator_name_lower = sorting.creator_name === "asc" ? 1 : -1;
      } else if (sorting.name) {
        aggregateQuery.push({
          $addFields: {
            name_lower: { $toLower: "$name" },
          },
        });
        sort.name_lower = sorting.name === "asc" ? 1 : -1;
      } else if (sorting.genre) {
        aggregateQuery.push({
          $addFields: {
            genre_lower: { $toLower: "$genre" },
          },
        });
        sort.genre_lower = sorting.genre === "asc" ? 1 : -1;
      }

      aggregateQuery.push({
        $sort: loadash.isEmpty(sort) ? { createdAt: -1 } : sort,
      });
    }
    if (
      pagination &&
      (pagination.page || pagination.page === 0) &&
      pagination.limit
    ) {
      aggregateQuery.push({
        $facet: {
          data: [
            { $skip: pagination.limit * pagination.page },
            { $limit: pagination.limit },
          ],
          countData: [{ $group: { _id: null, count: { $sum: 1 } } }],
        },
      });

      let songs = await Song.aggregate(aggregateQuery).allowDiskUse(true);
      const count_document =
        songs[0] && songs[0].countData[0] && songs[0].countData[0].count
          ? songs[0].countData[0].count
          : 0;
      return songs[0].data.map((data) => {
        return { ...data, count_document };
      });
    }

    return await Song.aggregate(aggregateQuery);
    console.log(a);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getSongById(_, args) {
  try {
    const user = await Song.findById(args._id);
    return user;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Mutation
async function addSong(_, { song_input }, context) {
  try {
    if ((context.user_type === "Administrator", "Creator")) {
      const created_by = context.user_id;
      return await Song.create({ ...song_input, created_by });
    }
    throw new Error("Its Only administrator or Creator for add some song");
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function updateSong(_, { _id, song_input }, context) {
  try {
    const ctx = context.user_id;
    const song = await Song.findById({ _id: _id });

    song.name = song_input.name;
    song.genre = song_input.genre;
    song.duration = song_input.duration;

    if (ctx._id.toString() === song.created_by.toString()) {
      await song.save();
      return song;
    }
    throw new Error("just Only user created can update this song");
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function deleteSong(_, { _id }, context) {
  try {
    const ctx = context.user_id;
    const song = await Song.findById({ _id: _id });

    if (ctx._id.toString() === song.created_by.toString()) {
      await Song.findOneAndRemove({ _id: _id });
      return true;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = {
  Mutation: {
    addSong,
    updateSong,
    deleteSong,
  },
  Song: {
    created_by,
  },
  Query: {
    getAllSongs,
    getSongById,
  },
};
