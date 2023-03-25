const { app } = require('electron');
const fs = require('fs');
const path = require('path');
const roamingPath = path.join(app.getPath('userData'), 'resources');
const settingsFilePath = path.join(roamingPath, 'settings.json');

function checkAndCreateSettingsFile() {

    // Settings
    function createSettingsFile() {
        const settingsData = {
            initSetupData: {
                initSetupRequired: true,
                projectID: '',
                databaseID: '',
                storageID: '',
            },
        };

        fs.writeFile(settingsFilePath, JSON.stringify(settingsData, null, 2), (err) => {
            if (err) {
                console.error('Error while creating settings.json:', err);
                return;
            }
            console.log('settings.json has been created successfully.');
            app.relaunch()
            app.exit()
        });
    }

    fs.access(settingsFilePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log('settings.json does not exist. Creating now...');
            createSettingsFile();
        } else {
            console.log('settings.json exists.');
        }
    });

}

module.exports = {
    checkAndCreateSettingsFile
};