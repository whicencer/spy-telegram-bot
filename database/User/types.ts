export interface IUser {
  userId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  
  languageCode: string;

  createdAt: number;
  lastReceiveMessageAt?: number;
}

export interface CreateUserDto {
  userId: number;
  firstName: string;
  languageCode: string;
  lastName?: string;
  username?: string;
}

export interface IUserRepository {
  create(userData: CreateUserDto): Promise<void>;
  exists(userId: number, throwError?: boolean): Promise<boolean>;
  getUserById(userId: number): Promise<IUser>;
  setAttribute(userId: number, key: string, value: any, returnResult?: boolean): Promise<IUser | void>;
}
