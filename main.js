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
const fsp = require('fs/promises');
const homedir = require('os').homedir()
const {
  autoUpdater
} = require('electron-updater')
var leasepath = '';
const os = require('os');
const hn = os.hostname();
const axios = require('axios');
const settingsFile = path.join(__dirname, '/resources/settings.json');

const apptest = false;

const resourcePath = path.join(process.env.HOME + '\\AppData\\Roaming\\lease-gen\\resources');

let appwriteProjectID;
let appwriteDatabaseID;
let appwriteStorageID;

fs.readFile(settingsFile, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const settings = JSON.parse(data);

  appwriteProjectID = settings.initSetupData.projectID;
  appwriteDatabaseID = settings.initSetupData.databaseID;
  appwriteStorageID = settings.initSetupData.storageID;


  logAppwriteProjectID(); // Log the global variable
});

function logAppwriteProjectID() {
  // console.log(`The appwriteProjectID is now set to ${appwriteProjectID}`);
  // console.log(`The appwriteDatabaseID is now set to ${appwriteDatabaseID}`);
  // console.log(`The appwriteStorageID is now set to ${appwriteStorageID}`);

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

        const writer = fs.createWriteStream(path.join(resourcePath, fileName));

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
      const file1Path = path.join(resourcePath, 'propertynames.json');
      const file2Path = path.join(resourcePath, 'propertyowners.json');

      // Replace with your actual Appwrite file IDs
      const file1AppwriteId = '641c8a254ed55f1a9f61';
      const file2AppwriteId = '641c8a1fe1e2e56d9bed';

      try {
        // Create the resource folder if it doesn't exist
        await fsp.mkdir(resourcePath, {
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
  fs.readFile(settingsFile, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const settings = JSON.parse(data);

    if (apptest == true) {
      mainWindow.loadFile('leasegen.html')
    } else if (settings.initSetupData.initSetupRequired == true) {
      mainWindow.loadFile('init.html')
    } else if (settings.initSetupData.initSetupRequired == false) {
      mainWindow.loadFile('login.html')
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
    fs.writeFile(settingsFile, JSON.stringify({
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
      mainWindow.loadFile('leasegen.html')
    }, function (error) {
      console.log(error);
      mainWindow.loadFile('login.html')
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

// Recives Lease Data from leasegen.html
ipcMain.on('leasedata', function (e, leasedata) {

  var pdf = require('html-pdf')
  const handlebars = require("handlebars")

  const databases = new Databases(client);

  //Create new item in database
  const promise = databases.createDocument(appwriteDatabaseID, '63f28cba281eb44a6d47', hn, {
    count: 1,
    office: leasedata.Office
  });

  promise.then(function (response) {
    console.log(response); // Success
  }, function (error) {
    console.log(error); // Failure

    const promise = databases.getDocument(appwriteDatabaseID, '63f28cba281eb44a6d47', hn);

    promise.then(function (response) {
      //if the computer already exists, update the count
      const promise = databases.updateDocument(appwriteDatabaseID, '63f28cba281eb44a6d47', hn, {
        count: response.count + 1
      });

      promise.then(function (response) {
        console.log(response); // Success
        createPDF(leasedata);
      }, function (error) {
        console.log(error); // Failure
      });

    }, function (error) {
      console.log(error); // Failure
    });
  });

  console.log(leasedata);

  // Uses Lease Data and leasetemp.html to make Lease PDF
  async function createPDF(leasedata) {

    const desktopDir = `${homedir}/Desktop`;

    if (leasedata.Office === 'Glenbrook') {
      if (leasedata.PropertyName === 'Bradford Ridge') {
        leasepath = '/resources/glenbrook/Bradford/'
      } else if (leasedata.PropertyName === 'Dupont Circle') {
        leasepath = '/resources/glenbrook/Dupont/'
      } else {
        leasepath = '/resources/glenbrook/'
      }
    } else {
      leasepath = '/resources/'
    }

    if (leasedata.PetType === '') {
      var templateHtml = fs.readFileSync(path.join(process.cwd(), leasepath + "Leasenopet.html"), 'utf8');
    } else {
      var templateHtml = fs.readFileSync(path.join(process.cwd(), leasepath + "Lease.html"), 'utf8');
    }

    var template = handlebars.compile(templateHtml);
    var html = template(leasedata);

    var pdfLeasePath = path.join(desktopDir, `${leasedata.LeaseHolders}-${leasedata.Unit}.pdf`);

    var options = {
      format: 'Letter',
      border: "5mm"
    };

    pdf.create(html, options).toFile(pdfLeasePath, function (err, res) {
      if (err) return console.log(err);
      console.log(res);
    });

  }
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', {
    version: app.getVersion()
  });
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});