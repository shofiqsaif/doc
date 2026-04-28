import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcrypt';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL?.replace('file:', '') || './dev.db'
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
    },
  });

  console.log('Admin user created:', adminEmail);

  const gettingStarted = await prisma.section.upsert({
    where: { slug: 'getting-started' },
    update: {},
    create: {
      title: 'Getting Started',
      slug: 'getting-started',
      order: 1,
    },
  });

  const apiReference = await prisma.section.upsert({
    where: { slug: 'api-reference' },
    update: {},
    create: {
      title: 'API Reference',
      slug: 'api-reference',
      order: 2,
    },
  });

  await prisma.doc.upsert({
    where: { slug: 'introduction' },
    update: {},
    create: {
      title: 'Introduction',
      slug: 'introduction',
      content: '<h1>Introduction</h1><p>Welcome to our documentation site. This is a sample document to help you get started.</p><p>You can edit this content using the admin panel.</p>',
      order: 1,
      sectionId: gettingStarted.id,
    },
  });

  await prisma.doc.upsert({
    where: { slug: 'installation' },
    update: {},
    create: {
      title: 'Installation',
      slug: 'installation',
      content: '<h1>Installation</h1><p>To install the package, run:</p><pre><code>npm install my-package</code></pre><p>Then import it in your project:</p><pre><code>import { myFunction } from "my-package";</code></pre>',
      order: 2,
      sectionId: gettingStarted.id,
    },
  });

  await prisma.doc.upsert({
    where: { slug: 'authentication' },
    update: {},
    create: {
      title: 'Authentication',
      slug: 'authentication',
      content: '<h1>Authentication</h1><p>All API requests require authentication. Include your API key in the header:</p><pre><code>Authorization: Bearer YOUR_API_KEY</code></pre><p>You can get your API key from the dashboard.</p>',
      order: 1,
      sectionId: apiReference.id,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
