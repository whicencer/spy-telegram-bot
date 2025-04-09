import { Collection } from "mongodb";
import { IUser, IUserRepository } from "./types";
import { Database } from "../db";

export class UserRepository implements IUserRepository {
  private collection: Collection<IUser>;
  private db: Database = new Database();
  constructor() {
    this.collection = this.db.database.collection<IUser>("users");
  }

  public async exists(userId: number, throwError: boolean = false): Promise<boolean> {
    const user = await this.collection.findOne({ userId });

    if (user) {
      return true;
    } else {
      if (throwError) {
        throw new Error(`User with id ${userId} does not exist`);
      }

      return false;
    }
  }
  
  public async create(
    userData: {
      userId: number;
      firstName: string;
      lastName?: string;
      username?: string;
    }
  ): Promise<void> {
    const newUserData: IUser = {
      ...userData,
      createdAt: Date.now()
    };

    const userExists = await this.exists(userData.userId, false);
    if (!userExists) {
      await this.collection.insertOne(newUserData);
    }
  }

  public async getUserById(userId: number): Promise<IUser> {
    const user = await this.collection.findOne({ userId });
    
    if (!user) {
      throw new Error(`User with id ${userId} does not exist`);
    }

    return user;
  }

  public async setAttribute(userId: number, key: string, value: any, returnResult: boolean = false): Promise<IUser | void> {
    await this.exists(userId, true);
    await this.collection.updateOne({ userId }, { $set: { [key]: value } });

    if (returnResult) {
      return await this.getUserById(userId);
    }
  }
}