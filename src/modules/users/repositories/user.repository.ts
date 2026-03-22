import { User } from "../user.entity";

export interface UserRepository {
  findUser(userId: number): Promise<User | null>;
  updateAvatar(userId: number, avatarKey: string): Promise<void>;
  findByEmail(email: string): Promise<User | null>; // FOR AUTHENTICATION
  searchByEmail(email: string): Promise<User[]>;    // FOR USER SEARCHING
}