const messagesResolvers = require("./messages");
const usersResolvers = require("./users");
const songResolvers = require("./song");

module.exports = {
  Query: {
    ...messagesResolvers.Query,
    ...usersResolvers.Query,
    ...songResolvers.Query,
  },
  Mutation: {
    ...messagesResolvers.Mutation,
    ...usersResolvers.Mutation,
    ...songResolvers.Mutation,
  },
};
