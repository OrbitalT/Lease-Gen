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

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  mainWindow.loadFile('index.html')

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

  // Uses Lease Data and leasetemp.html to make Lease PDF
  async function createPDF(leasedata) {

    const desktopDir = `${homedir}/Desktop`;

    if (leasedata.ConcessionAmount === 'none' && leasedata.PetType === 'none') {

      var templateHtml = fs.readFileSync(path.join(process.cwd(), 'leasenopetnocon.html'), 'utf8');
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

    } else {

      if (leasedata.ConcessionAmount === 'none') {

        var templateHtml = fs.readFileSync(path.join(process.cwd(), 'leasenocon.html'), 'utf8');
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

      } else {

        if (leasedata.PetType === 'none') {

          var templateHtml = fs.readFileSync(path.join(process.cwd(), 'leasenopet.html'), 'utf8');
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

        } else {

          var templateHtml = fs.readFileSync(path.join(process.cwd(), 'lease.html'), 'utf8');
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
      }
    }
  }

  createPDF(leasedata);

});