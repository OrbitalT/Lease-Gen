const {
    app
} = require('electron');
const {
    Client,
    Databases,
    Account,
    Storage
} = require("appwrite");
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const axios = require('axios');
const roamingPath = path.join(app.getPath('userData'), 'resources');
// const settingsFilePath = path.join(roamingPath, 'settings.json');

function logAppwriteProjectID(appwriteProjectID, appwriteDatabaseID, appwriteStorageID) {
    const client = new Client()
        .setEndpoint('https://fqkggzy316.nnukez.com/v1')
        .setProject(appwriteProjectID);

    const storage = new Storage(client);

    const promise = storage.listFiles(appwriteStorageID);

    promise.then(function (response) {
        // console.log(response); // Success

        async function fileExists(filePath) {
            try {
                await fsp.access(filePath);
                return true;
            } catch (error) {
                return false;
            }
        }

        async function downloadAndSaveFile(fileName, fileId) {
            // const storage = new Appwrite.Storage(client);

            const result = storage.getFileDownload(appwriteStorageID, fileId);

            try {
                const response = await axios({
                    method: 'GET',
                    url: result.href,
                    responseType: 'stream',
                });

                const writer = fs.createWriteStream(path.join(roamingPath, fileName));

                response.data.pipe(writer);

                return new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
            } catch (error) {
                throw new Error(`Failed to download file: ${error.message}`);
            }
        }

        async function main() {
            const file1Path = path.join(roamingPath, 'propertynames.json');
            const file2Path = path.join(roamingPath, 'propertyowners.json');

            // Replace with your actual Appwrite file IDs
            const file1AppwriteId = '641c8a254ed55f1a9f61';
            const file2AppwriteId = '641c8a1fe1e2e56d9bed';

            try {
                // Create the resource folder if it doesn't exist
                await fsp.mkdir(roamingPath, {
                    recursive: true
                });

                // Check for propertynames.json and download it if not found
                if (!(await fileExists(file1Path))) {
                    console.log('propertynames.json not found, downloading...');
                    await downloadAndSaveFile('propertynames.json', file1AppwriteId);
                    console.log('propertynames.json downloaded successfully.');
                } else {
                    console.log('propertynames.json found.');
                }

                // Check for propertyowners.json and download it if not found
                if (!(await fileExists(file2Path))) {
                    console.log('propertyowners.json not found, downloading...');
                    await downloadAndSaveFile('propertyowners.json', file2AppwriteId);
                    console.log('propertyowners.json downloaded successfully.');
                } else {
                    console.log('propertyowners.json found.');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }

        main();

    }, function (error) {
        console.log(error); // Failure
    });
}

module.exports = {
    logAppwriteProjectID
};