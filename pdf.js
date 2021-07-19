// For quick testing of puppeteer gen protion of code (node .\pdf.js)

const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer');
const handlebars = require("handlebars");

async function createPDF(data) {

    var templateHtml = fs.readFileSync(path.join(process.cwd(), 'lease.html'), 'utf8');
    var template = handlebars.compile(templateHtml);
    var html = template(data);

    var pdfPath = path.join('pdf', `${data.LeaseHolders}-${data.Unit}.pdf`);

    var options = {
        margin: {
            top: "10px",
            bottom: "30px",
            left: "50px",
            right: "50px"
          },
          printBackground: true,
          path: pdfPath,
          format: "Letter"
    }

    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        headless: true
    });

    var page = await browser.newPage();

    await page.goto(`data:text/html;charset=UTF-8,${html}`);

    await page.pdf(options);
    await browser.close();
}

const data = {
    LeaseHolders: "Bryce Logue",
    Occupants: "Addisyn Logue",
    TotalOccupants: "2",
    TotalAdults: "1",
    TotalChildren: "1",
    Unit: "5010-201",
    StreetName: "Garrett Rd",
    PropertyName: "Glenbrook East",
    PropertyOwner: "Ticon Properties LLC",
    LeaseTerm: "12",
    LeaseStart: "2021-07-18",
    LeaseEnd: "2022-07-18",
    MonthlyRent: "$1,000.00",
    RentTerm: "$12,000.00",
    SecurityDeposit: "$300.00",
    Utilities: "Included",
    WasherAndDryer: "Included",
    PetType: "1 - Cat",
    PetDeposit: "$200.00",
    ConcessionAmount: "$150.00",
    ConcessionType: "For 12 Month Lease"
}

createPDF(data);