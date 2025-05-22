// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { User, InsertUser } from '../../db/core/schema'; // Import Drizzle's User types
import { DrizzleCoreService } from '../../db/core/drizzle-core.service'; // Path to your DrizzleCoreService
import { user as userTable } from '../../db/core/schema'; // Import your Drizzle schema table aliased as userTable
import { eq } from 'drizzle-orm'; // Import Drizzle ORM functions
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from '../auth/dto/Register.dto'; // Import RegisterDto for user creation

@Injectable()
export class UsersService {
  constructor(private drizzleCoreService: DrizzleCoreService) {} // Inject DrizzleCoreService

  // Method to find a user by email (used for login validation)
  async findOne(email: string): Promise<User | undefined> {
    const foundUser = await this.drizzleCoreService.db.query.user.findFirst({
      where: eq(userTable.email, email),
    });
    // Drizzle returns the raw object. No need to transform if types match.
    // Make sure 'password' in User type maps to 'password' in DB.
    // If your schema uses `passwordHash`, adjust your User entity or Drizzle query to map.
    return foundUser || undefined; // Return undefined if not found
  }

  // Method to find a user by ID (useful for protected routes)
  async findOneById(id: string): Promise<User | undefined> {
    // ID is uuid, so string
    const foundUser = await this.drizzleCoreService.db.query.user.findFirst({
      where: eq(userTable.id, id),
    });
    return foundUser || undefined;
  }

  // Method to create a new user (used for registration)
  async create(createUserDto: RegisterDto): Promise<User> {
    // Check if user with this email already exists
    const existingUser = await this.findOne(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Prepare data for insertion using InsertUser type
    const insertData: InsertUser = {
      email: createUserDto.email,
      password: hashedPassword, // Store the hashed password
      name: createUserDto.name || null, // Ensure name is handled correctly if optional
    };

    const [newUser] = await this.drizzleCoreService.db
      .insert(userTable)
      .values(insertData)
      .returning(); // .returning() to get the inserted user back

    if (!newUser) {
      throw new Error('Failed to create user during insertion.'); // Should ideally not happen with .returning()
    }

    return newUser;
  }

  // --- Example of other CRUD operations ---

  async update(
    id: string,
    updateUserDto: { name?: string; email?: string },
  ): Promise<User> {
    const [updatedUser] = await this.drizzleCoreService.db
      .update(userTable)
      .set(updateUserDto) // Drizzle will only update provided fields
      .where(eq(userTable.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<{ affectedRows: number }> {
    const result = await this.drizzleCoreService.db
      .delete(userTable)
      .where(eq(userTable.id, id));
    // Drizzle's delete returns an empty array for postgres-js on success or the deleted rows.
    // You might want to check the actual effect or rely on cascade deletes.
    // For a simple check:
    // const deletedCount = result.length; // Check if any rows were returned
    // if (deletedCount === 0) {
    //   throw new NotFoundException(`User with ID ${id} not found.`);
    // }
    return { affectedRows: result ? 1 : 0 };
  }
}
