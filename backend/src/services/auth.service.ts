import prisma from '../config/prisma';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';

export class AuthService {
  async registerUser(name: string, email: string, plainPassword: string) {
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    // Generate JWT
    const token = generateToken(user.id, user.email);

    // Remove password before returning
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async loginUser(email: string, plainPassword: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(plainPassword, user.password);

    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT
    const token = generateToken(user.id, user.email);

    // Remove password before returning
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
