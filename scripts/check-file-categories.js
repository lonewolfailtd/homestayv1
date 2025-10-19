const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Check file categories in database
 * Run with: node scripts/check-file-categories.js
 */
async function checkFileCategories() {
  console.log('Checking file categories...\n');

  // Get all dog files
  const files = await prisma.dogFile.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(`Found ${files.length} files total\n`);

  // Group by category
  const byCategory = files.reduce((acc, file) => {
    if (!acc[file.fileCategory]) {
      acc[file.fileCategory] = [];
    }
    acc[file.fileCategory].push(file);
    return acc;
  }, {});

  for (const [category, categoryFiles] of Object.entries(byCategory)) {
    console.log(`\n${category.toUpperCase()} (${categoryFiles.length} files):`);
    categoryFiles.forEach(file => {
      console.log(`  - ${file.fileName} (${file.fileType})`);
    });
  }

  await prisma.$disconnect();
}

checkFileCategories()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
