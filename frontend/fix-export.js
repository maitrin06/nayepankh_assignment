const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'out');

function processDir(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name.startsWith('__next.')) {
        // This is an incorrectly nested directory!
        // We want to flatten all files inside it.
        flattenDirectory(fullPath, dir, item.name);
      } else {
        processDir(fullPath);
      }
    }
  }
}

function flattenDirectory(nestedDir, targetParentDir, prefix) {
  function traverse(currentDir, relativeParts = []) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      if (item.isDirectory()) {
        traverse(fullPath, [...relativeParts, item.name]);
      } else if (item.isFile()) {
        // Reconstruct correct file name
        // e.g. prefix = '__next.volunteers', relativeParts = [], item.name = '__PAGE__.txt'
        // result = '__next.volunteers.__PAGE__.txt'
        // e.g. prefix = '__next.dashboard', relativeParts = ['admin'], item.name = '__PAGE__.txt'
        // result = '__next.dashboard.admin.__PAGE__.txt'
        const newName = [prefix, ...relativeParts, item.name].join('.');
        const targetPath = path.join(targetParentDir, newName);
        console.log(`Fixing Windows export path: Moving ${fullPath} -> ${targetPath}`);
        fs.renameSync(fullPath, targetPath);
      }
    }
  }

  traverse(nestedDir);
  
  // Clean up directory
  fs.rmSync(nestedDir, { recursive: true, force: true });
}

if (fs.existsSync(outDir)) {
  console.log('Running Next.js static export path fixer for Windows...');
  processDir(outDir);
  console.log('Path fix completed successfully.');
} else {
  console.error('Error: "out" directory not found.');
}
