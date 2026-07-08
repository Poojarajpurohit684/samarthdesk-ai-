import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

async function main() {
  logger.info('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@samarthdesk.com' },
    update: {},
    create: {
      email: 'admin@samarthdesk.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isEmailVerified: true,
      isActive: true,
    },
  });

  logger.info(`Admin user created: ${admin.email}`);

  // Create support agent
  const agentPassword = await bcrypt.hash('Agent@123', 10);
  const agent = await prisma.user.upsert({
    where: { email: 'agent@samarthdesk.com' },
    update: {},
    create: {
      email: 'agent@samarthdesk.com',
      password: agentPassword,
      firstName: 'Support',
      lastName: 'Agent',
      role: 'AGENT',
      isEmailVerified: true,
      isActive: true,
    },
  });

  logger.info(`Support agent created: ${agent.email}`);

  // Create customer
  const customerPassword = await bcrypt.hash('Customer@123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
      isEmailVerified: true,
      isActive: true,
    },
  });

  logger.info(`Customer user created: ${customer.email}`);

  logger.info('Database seed completed successfully!');
}

main()
  .catch((error) => {
    logger.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
