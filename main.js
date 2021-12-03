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

  console.log(leasedata);

  var leasedata = {
    LeaseHolders: 'Bryce Logue',
    Occupants: ' ',
    TotalOccupants: '1',
    TotalAdults: '1',
    TotalChildren: '0',
    LeaseTerm: '12',
    LeaseStart: '12/2/2021',
    MonthlyRent: '$1,000.00',
    SecurityDeposit: '$300.00',
    Unit: '5010-202',
    StreetName: '',
    PropertyName: 'Glenbrook West',
    PropertyOwner: 'WJM',
    Utilities: 'No Utility',
    WasherAndDryer: 'Included',
    PetType: '1 - Cat',
    PetDeposit: '$300.00',
    PetPayable: 'Already Paid',
    Office: 'glenbrook'
  }

  //Retype all Lease Docs. Combine Audubon and PineRidge Docs as they share same pool and fitness pages. Remove Concession options

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

          var templateHtml = fs.readFileSync(path.join(process.cwd(), "/resources/Lease.html"), 'utf8');

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