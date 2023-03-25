const {
  app,
  BrowserWindow,
  ipcMain,
  Menu
} = require('electron')
const {
  Client,
  Databases,
  Account,
  Storage
} = require("appwrite")
const path = require('path')
const fs = require('fs');
const {
  autoUpdater
} = require('electron-updater')
const roamingPath = path.join(app.getPath('userData'), 'resources');
const settingsFilePath = path.join(roamingPath, 'settings.json');

const apptest = false;

const {
  checkAndCreateSettingsFile
} = require('./src/functions/checkforsettings.js');

const {
  logAppwriteProjectID
} = require('./src/functions/checkforfiles.js');

app.whenReady().then(() => {
  checkAndCreateSettingsFile();
});

let appwriteProjectID;
let appwriteDatabaseID;
let appwriteStorageID;

fs.readFile(settingsFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const settings = JSON.parse(data);

  appwriteProjectID = settings.initSetupData.projectID;
  appwriteDatabaseID = settings.initSetupData.databaseID;
  appwriteStorageID = settings.initSetupData.storageID;

  logAppwriteProjectID(appwriteProjectID, appwriteDatabaseID, appwriteStorageID); // Log the global variable
});

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 750,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  var menu = Menu.buildFromTemplate([{
    label: 'menu',
    submenu: [
      // {
      //   label: 'Docs',
      //   click() {
      //     shell.openExternal('https://github.com/OrbitalT/Lease-Gen/blob/Master/README.md')
      //   }
      // },
      {
        role: 'toggleDevTools'
      },
      {
        label: 'Exit',
        click() {
          app.quit()
        }
      }
    ]
  }])

  Menu.setApplicationMenu(menu);

  //Login
  fs.readFile(settingsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const settings = JSON.parse(data);

    if (apptest == true) {
      mainWindow.loadFile('./public/leasegen.html')
    } else if (settings.initSetupData.initSetupRequired == true) {
      mainWindow.loadFile('./public/init.html')
    } else if (settings.initSetupData.initSetupRequired == false) {
      mainWindow.loadFile('./public/login.html')
    }
  });

  ipcMain.on('initSetup', function (e, initSetup) {

    console.log(initSetup);

    // Define the values to be written to the file
    const initSetupData = {
      initSetupRequired: false,
      projectID: initSetup.projectID,
      databaseID: initSetup.databaseID,
      storageID: initSetup.storageID
    };

    // Write the values to the file
    fs.writeFile(settingsFilePath, JSON.stringify({
      initSetupData
    }), 'utf8', (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('File successfully written!');
      app.relaunch()
      app.exit()
    });

  });

  ipcMain.on('userLogin', function (e, userLogin) {
    const client = new Client()
      .setEndpoint('https://fqkggzy316.nnukez.com/v1')
      .setProject(appwriteProjectID);

    const account = new Account(client);

    const promise = account.createEmailSession(userLogin.email, userLogin.password);

    promise.then(function (response) {
      console.log(response);
      mainWindow.loadFile('./public/leasegen.html')
    }, function (error) {
      console.log(error);
      mainWindow.loadFile('./public/login.html')
    });
  });

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
  });
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on("request-roaming-path", (event) => {
  event.sender.send("receive-roaming-path", roamingPath);
});

// Recives Lease Data from leasegen.html
ipcMain.on('leasedata', function (e, leasedata) {
  const {
    createLease
  } = require('./src/functions/createlease.js');
  createLease(leasedata, appwriteProjectID, appwriteDatabaseID, appwriteStorageID);
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', {
    version: app.getVersion()
  });
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});