import { User } from "../user.entity";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>; // FOR AUTHENTICATION
  searchByEmail(email: string): Promise<User[]>;    // FOR USER SEARCHING
}