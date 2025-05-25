import { Collection } from "mongodb";
import { type CreateMessageDto, type IMessage, type IMessagesRepository } from "./types";
import { Database } from "../db";

export class MessagesRepository implements IMessagesRepository {
  private collection: Collection<IMessage>;
  private db: Database = new Database();

  constructor() {
    this.collection = this.db.database.collection<IMessage>("messages");
  }

  public async create(newMessageData: CreateMessageDto): Promise<IMessage> {
    const newMessage: IMessage = {
      ...newMessageData,
      isEdited: false,
      isDeleted: false,
      sentAt: Date.now(),
      editedMessages: []
    };

    await this.collection.insertOne(newMessage);
    return newMessage;
  }

  public async getById(messageId: number): Promise<IMessage> {
    const message = await this.collection.findOne({ messageId });

    if (!message) {
      throw new Error(`Message with id ${messageId} does not exist`);
    }
    return message;
  }

  public async exists(messageId: number, throwError: boolean = false): Promise<boolean> {
    const message = await this.collection.findOne({ messageId });

    if (message) {
      return true;
    } else {
      if (throwError) {
        throw new Error(`Message with userId ${messageId} does not exist`);
      }
      return false;
    }
  }

  public async setAttribute(messageId: number, key: string, value: any, returnResult: boolean = false): Promise<IMessage | void> {
    await this.exists(messageId, true);
    await this.collection.updateOne({ messageId }, { $set: { [key]: value } });

    if (returnResult) {
      return await this.getById(messageId);
    }
  }

  public async messageEdited(messageId: number, oldMessageText: string, newMessageText: string): Promise<void> {
    await this.setAttribute(messageId, "text", newMessageText);
    await this.setAttribute(messageId, "isEdited", true);
    await this.setAttribute(messageId, "editedAt", Date.now());
    
    await this.collection.updateOne(
      { messageId },
      { $push: { editedMessages: { oldMessageText, editedAt: Date.now() } } }
    );
  }
}