const {
    app
} = require('electron');
const {
    Client,
    Storage
} = require('appwrite');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const axios = require('axios');
const roamingPath = path.join(app.getPath('userData'), 'resources');

async function downloadAndSaveFile(storage, storageId, fileId, fileName, destination) {
    const downloadUrl = (await storage.getFileDownload(storageId, fileId)).href;
    const response = await axios.get(downloadUrl, {
        responseType: 'stream'
    });

    const writer = fs.createWriteStream(destination);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function main(appwriteProjectID, appwriteStorageID) {
    const client = new Client()
        .setEndpoint('https://fqkggzy316.nnukez.com/v1')
        .setProject(appwriteProjectID);
    const storage = new Storage(client);

    const files = [{
            name: 'propertynames.json',
            id: '641c8a254ed55f1a9f61'
        },
        {
            name: 'propertyowners.json',
            id: '641c8a1fe1e2e56d9bed'
        },
    ];

    try {
        await fsp.mkdir(roamingPath, {
            recursive: true
        });

        for (const file of files) {
            const filePath = path.join(roamingPath, file.name);
            try {
                await fsp.access(filePath);
                console.log(`${file.name} found.`);
            } catch (error) {
                console.log(`${file.name} not found, downloading...`);
                await downloadAndSaveFile(storage, appwriteStorageID, file.id, file.name, filePath);
                console.log(`${file.name} downloaded successfully.`);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function logAppwriteProjectID(appwriteProjectID, appwriteDatabaseID, appwriteStorageID) {
    const client = new Client()
        .setEndpoint('https://fqkggzy316.nnukez.com/v1')
        .setProject(appwriteProjectID);

    const storage = new Storage(client);
    storage.listFiles(appwriteStorageID)
        .then(() => main(appwriteProjectID, appwriteStorageID))
        .catch(error => console.error('Error:', error));
}

module.exports = {
    logAppwriteProjectID
};