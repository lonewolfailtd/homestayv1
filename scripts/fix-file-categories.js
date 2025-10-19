const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Fix file categories for existing dog files
 * Run with: node scripts/fix-file-categories.js
 */
async function fixFileCategories() {
  console.log('Starting file category fix...\n');

  // Get all dog files
  const files = await prisma.dogFile.findMany();

  console.log(`Found ${files.length} files to process\n`);

  let updated = 0;

  for (const file of files) {
    let newCategory = file.fileCategory;

    // Auto-detect category based on file type and name
    if (file.fileType.startsWith('image/')) {
      newCategory = 'photo';
    }
    else if (file.fileName.toLowerCase().match(/(vacc|immunis|shot|jab)/)) {
      newCategory = 'vaccination';
    }
    else if (file.fileName.toLowerCase().match(/(vet|veterinary|clinic|medical|health)/)) {
      newCategory = 'vet';
    }

    // Update if category changed
    if (newCategory !== file.fileCategory) {
      await prisma.dogFile.update({
        where: { id: file.id },
        data: { fileCategory: newCategory }
      });

      console.log(`✓ Updated ${file.fileName}: ${file.fileCategory} → ${newCategory}`);
      updated++;
    }
  }

  console.log(`\n✓ Fixed ${updated} file categories`);

  await prisma.$disconnect();
}

fixFileCategories()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
