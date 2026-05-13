const fs = require('fs/promises');
const path = require('path');

const deleteFiles = async (filePaths) => {
  if (!filePaths || !filePaths.length) return;
  
  for (const filePath of filePaths) {
    if (typeof filePath === 'string' && filePath.trim() !== '') {
      const normalizedPath = path.posix.normalize(filePath);
      
      // Safety net: only allow deletion within the uploads directory
      if (normalizedPath.startsWith('/uploads/')) {
        const fullPath = path.join(__dirname, '..', normalizedPath);
        try {
          await fs.unlink(fullPath);
          console.log(`🗑️ Erased physical file payload: ${normalizedPath}`);
        } catch (err) {
          // Skip logging aggressive errors as file might be already missing or corrupted
        }
      }
    }
  }
};

module.exports = { deleteFiles };
