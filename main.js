const {
  app,
  BrowserWindow,
  ipcMain,
  Menu
} = require('electron')
const {
  Client,
  Databases,
  Account
} = require("appwrite")
const path = require('path')
const fs = require('fs')
var pdf = require('html-pdf')
const handlebars = require("handlebars")
const homedir = require('os').homedir()
const {
  autoUpdater
} = require('electron-updater')
const shell = require('electron').shell
var leasepath = '';
const os = require('os');
const hn = os.hostname();

const client = new Client()
  .setEndpoint('https://fqkggzy316.nnukez.com/v1') // Your API Endpoint
  .setProject('63f2857b2a911f0f957c') // Your project ID
;

const account = new Account(client);

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
    label: 'Menu',
    submenu: [{
        label: 'CSV',
        click() {
          openCSVWindow()
        }
      },
      {
        label: 'Docs',
        click() {
          shell.openExternal('https://github.com/OrbitalT/Lease-Gen/blob/Master/README.md')
        },
        accelerator: 'Alt+D'
      },
      {
        type: 'separator'
      },
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

  var newWindow = null

  function openCSVWindow() {
    if (newWindow) {
      newWindow.focus()
      return
    }

    newWindow = new BrowserWindow({
      width: 600,
      height: 400,
      resizable: true,
      title: '',
      minimizable: false,
      fullscreenable: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
    })

    newWindow.loadURL(path.join(__dirname, 'csv.html'))

    newWindow.on('closed', function () {
      newWindow = null
    })
  }

  mainWindow.loadFile('apps.html')

  //Login

  // const apptest = true;

  // if (apptest == true) {
  //   mainWindow.loadFile('apps.html')
  // } else {

  //   const promise = account.get();

  //   promise.then(function (response) {
  //     console.log(response);
  //     mainWindow.loadFile('apps.html')
  //   }, function (error) {
  //     console.log(error);
  //     mainWindow.loadFile('login.html')
  //   });

  // }

  // ipcMain.on('userLogin', function (e, userLogin) {
  //   const promise = account.createEmailSession(userLogin.email, userLogin.password);

  //   promise.then(function (response) {
  //     console.log(response);
  //     mainWindow.loadFile('apps.html')
  //   }, function (error) {
  //     console.log(error);
  //     mainWindow.loadFile('login.html')
  //   });
  // });

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

// Recives Lease Data from index.html
ipcMain.on('leasedata', function (e, leasedata) {

  const databases = new Databases(client);

  //Create new item in database
  const promise = databases.createDocument('63f28c799dea8d9b54aa', '63f28cba281eb44a6d47', hn, {
    count: 1,
    office: leasedata.Office
  });

  promise.then(function (response) {
    console.log(response); // Success
  }, function (error) {
    console.log(error); // Failure

    const promise = databases.getDocument('63f28c799dea8d9b54aa', '63f28cba281eb44a6d47', hn);

    promise.then(function (response) {
      //if the computer already exists, update the count
      const promise = databases.updateDocument('63f28c799dea8d9b54aa', '63f28cba281eb44a6d47', hn, {
        count: response.count + 1
      });

      promise.then(function (response) {
        console.log(response); // Success
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

    var pdfPath = path.join(desktopDir, `${leasedata.LeaseHolders}-${leasedata.Unit}.pdf`);

    var options = {
      format: 'Letter',
      border: "5mm"
    };

    pdf.create(html, options).toFile(pdfPath, function (err, res) {
      if (err) return console.log(err);
      console.log(res);
    });

  }

  createPDF(leasedata);

});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', {
    version: app.getVersion()
  });
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});