const sdk = require('node-appwrite'); // Import the Appwrite SDK
const fs = require('fs'); // Import the File System module
const path = require('path'); // Import the Path module

const client = new sdk.Client(); // Initialize the SDK
const storage = new sdk.Storage(client); // Initialize Storage SDK

const roamingPath = path.join('C:\\Users\\Bryce\\AppData\\Roaming\\lease-gen', 'resources'); // Path to the resources folder

// Your project ID and secret API key
const appwriteProjectID = '63f2857b2a911f0f957c';
const appwriteApiKey = '7f81e37fb1558d1096fb03841bf263f1efaf3e94f3f843c85234438cd9764e082b81aad6240b398ad001fa32401deb26e3ea43fb1c4c0cb4e8415c8af4a1d63c5bd381b172a3c155b790718f57bd3e6ec28bfcaa1a1abd3725183206137bc177d168e5c6db373742119247e524c34394ee3b0fc01f7d0e38494c10b32d536eb0';

client
    .setEndpoint('https://fqkggzy316.nnukez.com/v1') // Your API Endpoint
    .setProject(appwriteProjectID) // Your project ID
    .setKey(appwriteApiKey); // Your secret API key

async function getInitFiles() {
    try {
        const listBuckets = await storage.listBuckets();
        const initFilesBucket = listBuckets.buckets.find(bucket => bucket.name === 'InitFiles');
        const initid = initFilesBucket.$id;

        const listFiles = await storage.listFiles(initid);
        const propertyowners = listFiles.files.find(file => file.name === 'propertyowners.json');
        const propertynames = listFiles.files.find(file => file.name === 'propertynames.json');

        const propnamesid = propertynames.$id;
        const propownersid = propertyowners.$id;

        console.log(propnamesid);
        console.log(propownersid);

        // Check if the files exist
        const propownersPath = path.join(roamingPath, 'propertyowners.json');
        const propnamesPath = path.join(roamingPath, 'propertynames.json');

        if (fs.existsSync(propownersPath) && fs.existsSync(propnamesPath)) {
            console.log('Both files exist');
        } else {
            console.log('One or both files do not exist');
        }

    } catch (error) {
        console.log(error);
    }
}

getInitFiles();