const {
  app,
  BrowserWindow,
  ipcMain
} = require('electron')
const path = require('path')
const fs = require('fs')
const puppeteer = require('puppeteer')
const handlebars = require("handlebars")

// fs.readFile("./LeaseData.json", "utf8", (err, jsonString) => {
//   if (err) {
//     console.log("File read failed:", err);
//     return;
//   }
//   console.log(jsonString);
// });

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

    var templateHtml = fs.readFileSync(path.join(process.cwd(), 'leasetemp.html'), 'utf8');
    var template = handlebars.compile(templateHtml);
    var html = template(leasedata);

    var pdfPath = path.join('pdf', `${leasedata.LeaseHolders}-${leasedata.Unit}.pdf`);

    var options = {
      // width: '1230px',
      headerTemplate: "<p></p>",
      footerTemplate: "<p></p>",
      displayHeaderFooter: false,
      margin: {
        top: "10px",
        bottom: "30px",
        left: "50px",
        right: "50px"
      },
      printBackground: true,
      path: pdfPath,
      format: 'Letter'
    }

    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: true
    });

    var page = await browser.newPage();

    await page.goto(`data:text/html;charset=UTF-8,${html}`, {
      waitUntil: 'networkidle2'
    });

    await page.pdf(options);
    await browser.close();
  }

  createPDF(leasedata);

});