/*import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI || "");

export async function getDb() {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
  return client.db("medlink");
}*/

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const client = new MongoClient(uri);

let isConnected = false;

export async function getDb() {
  try {
    if (!isConnected) {
      await client.connect();
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. Successfully connected to MongoDB!");
      isConnected = true;
    }
    return client.db("medlink");
  } catch (error) {
    console.log("Failed to connect to MongoDB:", error);
    throw error;
  }
}
