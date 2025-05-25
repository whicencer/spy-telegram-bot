export interface IMessage {
  messageId: number;
  text: string;
  userId: number;

  senderId: number;
  senderName: string;
  senderUsername?: string;

  isEdited: boolean;
  isDeleted: boolean;

  editedAt?: number;
  deletedAt?: number;

  sentAt: number;
  editedMessages: Array<{ oldMessageText: string, editedAt?: number }>;
}

export interface CreateMessageDto {
  messageId: number;
  text: string;
  userId: number;
  senderId: number;
  senderName: string;
  senderUsername?: string;
}

export interface IMessagesRepository {
  create(message: CreateMessageDto): Promise<IMessage>;
  getById(messageId: number): Promise<IMessage>;
  setAttribute(messageId: number, key: string, value: any, returnResult?: boolean): Promise<IMessage | void>;
  exists(userId: number, throwError: boolean): Promise<boolean>;
  messageEdited(messageId: number, oldMessageText: string, newMessageText: string): Promise<void>;
}