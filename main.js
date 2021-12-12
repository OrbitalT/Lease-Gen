// FIX Submit button style to add depth. FIX save office choice to prevent changing each time
// 3.0.0 Mass Lease gen from list
// Seperate all addendums into files which can get loaded in
// 4.0.0 Add ability to Edit Lease, Properties, Offices, Owners, ETC

const {
  app,
  BrowserWindow,
  ipcMain,
  Menu
} = require('electron')
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

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 450,
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

  mainWindow.loadFile('index.html')

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

  console.log(leasedata);

  // Uses Lease Data and leasetemp.html to make Lease PDF
  async function createPDF(leasedata) {

    const desktopDir = `${homedir}/Desktop`;

    if (leasedata.Office === 'Glenbrook') {
      leasepath = '/resources/glenbrook/'
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