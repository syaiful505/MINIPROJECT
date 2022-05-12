const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const port = 3300;

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const { authMiddleware } = require("./middleware/index");
const { makeExecutableSchema } = require("graphql-tools");
const { applyMiddleware } = require("graphql-middleware");

const MONGODB = "mongodb://localhost:27017/mini-project";
const executableSchema = makeExecutableSchema({ typeDefs, resolvers });
const protectedSchema = applyMiddleware(executableSchema, authMiddleware);

const server = new ApolloServer({
  schema: protectedSchema,
  typeDefs,
  resolvers,
  context: (req) => ({
    req: req.req,
  }),
});

// Database Configure
mongoose
  .connect(MONGODB, {
    useNewUrlParser: true,
  })
  .then((result) => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.log("Error Not Connect to MongoDB", error.message);
  });

//server Configure
server.start().then(res => {
  server.applyMiddleware({ app });
  app.listen({ port }, () =>
    console.log("Server Conected")
  )
 })