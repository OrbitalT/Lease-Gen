const {
    app
} = require('electron');
const fs = require('fs').promises;
const path = require('path');

const roamingPath = path.join(app.getPath('userData'), 'resources');
const settingsFilePath = path.join(roamingPath, 'settings.json');

const defaultSettingsData = {
    initSetupData: {
        initSetupRequired: true,
        projectID: '',
        databaseID: '',
        storageID: '',
    },
};

async function createSettingsFile() {
    try {
        await fs.writeFile(settingsFilePath, JSON.stringify(defaultSettingsData, null, 2));
        console.log('settings.json has been created successfully.');
        app.relaunch();
        app.exit();
    } catch (err) {
        console.error('Error while creating settings.json:', err);
    }
}

async function checkAndCreateSettingsFile() {
    try {
        await fs.access(settingsFilePath);
        console.log('settings.json exists.');
    } catch (err) {
        console.log('settings.json does not exist. Creating now...');
        await createSettingsFile();
    }
}

module.exports = {
    checkAndCreateSettingsFile,
};