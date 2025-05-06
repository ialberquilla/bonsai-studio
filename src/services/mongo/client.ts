import { MongoClient } from "mongodb";

import { IS_PRODUCTION } from "@src/services/madfi/utils";

const uri = process.env.MONGO_URI;

let mongoClient: MongoClient;
const databases = {};

if (!uri) {
  throw new Error("Please add your Mongo URI to .env/.env.local");
}

const connectToDatabase = async (databaseName: string) => {
  let database = databases[databaseName];
  try {
    if (mongoClient && database) {
      return { mongoClient, database };
    }
    if (!IS_PRODUCTION) {
      if (!global._mongoClient) {
        mongoClient = await new MongoClient(uri).connect();
        global._mongoClient = mongoClient;
      } else {
        mongoClient = global._mongoClient;
      }
    } else {
      mongoClient = await new MongoClient(uri).connect();
    }
    database = await mongoClient.db(databaseName);
    databases[databaseName] = database;
    return { mongoClient, database };
  } catch (e) {
    console.error(e);
  }
};

export const getClientWithCreatorInfo = async () => {
  // @ts-ignore
  const { database } = await connectToDatabase("creators");
  const collection = database.collection("creator-info");

  return { collection, database };
};

export const getClientWithClubs = async () => {
  // @ts-ignore
  const { database } = await connectToDatabase("moonshot");
  const _collection = IS_PRODUCTION ? "clubs-prod" : "clubs";
  const collection = database.collection(_collection);

  return { collection, database };
};

export const getClientWithMedia = async (__client?: any) => {
  // @ts-ignore
  const { database } = await connectToDatabase("client-bonsai");
  const collection = database.collection("media");

  return { collection, database };
};
