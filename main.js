const {
  app,
  BrowserWindow,
  ipcMain
} = require('electron')
const path = require('path')
const fs = require('fs')
var pdf = require('html-pdf')
const handlebars = require("handlebars")
const homedir = require('os').homedir()
const {
  autoUpdater
} = require('electron-updater')

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

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
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

  const office = leasedata.Office;

  // Uses Lease Data and leasetemp.html to make Lease PDF
  async function createPDF(leasedata) {

    const desktopDir = `${homedir}/Desktop`;

    if (leasedata.ConcessionAmount === 'none' && leasedata.PetType === 'none') {

      var templateHtml = fs.readFileSync(path.join(process.cwd(), "/resources/" + office + "/leasenopetnocon.html"), 'utf8');

    } else {

      if (leasedata.ConcessionAmount === 'none') {

        var templateHtml = fs.readFileSync(path.join(process.cwd(), "/resources/" + office + "/leasenocon.html"), 'utf8');

      } else {

        if (leasedata.PetType === 'none') {

          var templateHtml = fs.readFileSync(path.join(process.cwd(), "/resources/" + office + "/leasenopet.html"), 'utf8');

        } else {

          var templateHtml = fs.readFileSync(path.join(process.cwd(), "/resources/" + office + "/lease.html"), 'utf8');

        }
      }
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