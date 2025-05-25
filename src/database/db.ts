import { Db, MongoClient } from "mongodb";
import { getEnvVariable } from "../utils/getEnvVariable";

export class Database {
  private client: MongoClient = new MongoClient(getEnvVariable("MONGODB_URL"));
  private db: Db = this.client.db("persist_messages_bot");
  constructor() {}

  public async connect() {
    try {
      await this.client.connect();
      console.log("Connected to MongoDB");
    } catch (error) {
      throw new Error("Failed to connect to MongoDB");
    }
  }

  public get database(): Db {
    return this.db;
  }
}