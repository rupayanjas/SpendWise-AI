import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import prisma from './config/prisma';
import bcrypt from 'bcrypt';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test Database Connection
    await prisma.$connect();
    console.log('✓ Database Connected');

    // Seed Demo User if database is empty
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('Test@12345', 10);
      await prisma.user.create({
        data: {
          name: 'Demo User',
          email: 'test@example.com',
          password: hashedPassword
        }
      });
      console.log('✓ Demo User seeded: test@example.com');
    }

    // Start Express Server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database. Error:', error);
    process.exit(1);
  }
};

startServer();
