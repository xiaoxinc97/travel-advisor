import fs from 'fs';
import path from 'path';

const folderPath = path.resolve('./service'); 

// execute the service file and retry if it fails.
async function executeService(file, retries = 3) {
    const filePath = `file://${path.join(folderPath, file)}`;

    try {
        await import(filePath);
        console.log(`Executed ${file}`);
    } catch (error) {
        console.error(`Error executing ${file}:`, error);
        if (retries > 0) {
            console.log(`Retrying ${file}, attempts remaining: ${retries}`);
            await executeService(file, retries - 1);
        } else {
            console.error(`Failed to execute ${file} after multiple attempts.`);
        }
    }
}

// read all files in the service folder and execute them.
fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.forEach(file => {
        if (file.endsWith('.js')) {
            executeService(file);
        }
    });
});
