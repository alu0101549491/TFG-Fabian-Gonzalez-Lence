/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since February 18, 2026
 * @file prisma/seed.ts
 * @desc Database seeding script with initial data for development
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/4-CartographicProjectManager}
 */

import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Main seed function
 */
async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.taskHistory.deleteMany();
  await prisma.taskFile.deleteMany();
  await prisma.task.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.file.deleteMany();
  await prisma.projectSpecialUser.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleared existing data');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const clientPassword = await bcrypt.hash('client123', 10);

  const admin = await prisma.user.create({
    data: {
      username: 'Admin User',
      email: 'admin@cartographic.com',
      passwordHash: adminPassword,
      role: 'ADMINISTRATOR',
      phone: '+34600000001',
      whatsappEnabled: true,
    },
  });

  const client1 = await prisma.user.create({
    data: {
      username: 'John Client',
      email: 'john@example.com',
      passwordHash: clientPassword,
      role: 'CLIENT',
      phone: '+34600000002',
      whatsappEnabled: false,
    },
  });

  const client2 = await prisma.user.create({
    data: {
      username: 'Maria Garcia',
      email: 'maria@example.com',
      passwordHash: clientPassword,
      role: 'CLIENT',
      phone: '+34600000003',
      whatsappEnabled: true,
    },
  });

  const specialUser = await prisma.user.create({
    data: {
      username: 'Special User',
      email: 'special@example.com',
      passwordHash: clientPassword,
      role: 'SPECIAL_USER',
    },
  });

  console.log('✓ Created users');

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      code: 'CART-2025-001',
      name: 'Residential Urbanization Los Pinos',
      year: 2025,
      clientId: client1.id,
      type: 'RESIDENTIAL',
      coordinateX: -16.2518,
      coordinateY: 28.4636,
      contractDate: new Date('2025-01-15'),
      deliveryDate: new Date('2025-06-30'),
      status: 'IN_PROGRESS',
      dropboxFolderId: '/projects/CART-2025-001',
    },
  });

  const project2 = await prisma.project.create({
    data: {
      code: 'CART-2025-002',
      name: 'Commercial Center Plaza Mayor',
      year: 2025,
      clientId: client2.id,
      type: 'COMMERCIAL',
      coordinateX: -16.3195,
      coordinateY: 28.4792,
      contractDate: new Date('2025-02-01'),
      deliveryDate: new Date('2025-08-15'),
      status: 'ACTIVE',
      dropboxFolderId: '/projects/CART-2025-002',
    },
  });

  console.log('✓ Created projects');

  // Add special user to project
  await prisma.projectSpecialUser.create({
    data: {
      projectId: project1.id,
      userId: specialUser.id,
    },
  });

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      projectId: project1.id,
      creatorId: admin.id,
      assigneeId: client1.id,
      description: 'Review and approve topographic plans',
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: new Date('2025-03-01'),
      comments: 'Please review all boundary markers',
    },
  });

  const task2 = await prisma.task.create({
    data: {
      projectId: project1.id,
      creatorId: client1.id,
      assigneeId: admin.id,
      description: 'Update coordinate system to ETRS89',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: new Date('2025-02-25'),
    },
  });

  console.log('✓ Created tasks');

  // Create messages
  await prisma.message.create({
    data: {
      projectId: project1.id,
      senderId: admin.id,
      content: 'Project initiated. Please review the initial documentation.',
    },
  });

  await prisma.message.create({
    data: {
      projectId: project1.id,
      senderId: client1.id,
      content: 'Documentation reviewed. Everything looks good!',
    },
  });

  console.log('✓ Created messages');

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: client1.id,
      type: 'NEW_TASK',
      title: 'New Task Assigned',
      message: 'You have been assigned a new task: Review and approve topographic plans',
      projectId: project1.id,
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: admin.id,
      type: 'PROJECT_ASSIGNED',
      title: 'New Project Created',
      message: 'Project CART-2025-001 has been created successfully',
      projectId: project1.id,
      isRead: true,
    },
  });

  console.log('✓ Created notifications');

  // Create files
  await prisma.file.create({
    data: {
      projectId: project1.id,
      uploadedBy: admin.id,
      filename: 'plan_topografico.pdf',
      originalName: 'Plan Topográfico Los Pinos.pdf',
      type: 'PDF',
      size: 2458967,
      mimeType: 'application/pdf',
      dropboxPath: '/projects/CART-2025-001/plan_topografico.pdf',
    },
  });

  await prisma.file.create({
    data: {
      projectId: project1.id,
      uploadedBy: admin.id,
      filename: 'coordinates.kml',
      originalName: 'Coordinates.kml',
      type: 'KML',
      size: 156789,
      mimeType: 'application/vnd.google-earth.kml+xml',
      dropboxPath: '/projects/CART-2025-001/coordinates.kml',
    },
  });

  console.log('✓ Created files');

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: 4 (1 admin, 2 clients, 1 special user)`);
  console.log(`   - Projects: 2`);
  console.log(`   - Tasks: 2`);
  console.log(`   - Messages: 2`);
  console.log(`   - Notifications: 2`);
  console.log(`   - Files: 2`);
  console.log('\n🔐 Admin credentials:');
  console.log(`   Email: admin@cartographic.com`);
  console.log(`   Password: admin123`);
  console.log('\n🔐 Client credentials:');
  console.log(`   Email: john@example.com`);
  console.log(`   Password: client123\n`);
}

main()
  .catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
