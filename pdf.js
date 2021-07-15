const path = require('path')
const fs = require('fs')
const puppeteer = require('puppeteer')
const handlebars = require("handlebars")

async function createPDF(LeaseData) {

    var templateHtml = fs.readFileSync(path.join(process.cwd(), 'leasetemp.html'), 'utf8');
    var template = handlebars.compile(templateHtml);
    var html = template(LeaseData);

    var milis = new Date();
    milis = milis.getTime();

    var pdfPath = path.join('pdf', `temp.pdf`);

    var options = {
        width: '1230px',
        headerTemplate: "<p></p>",
        footerTemplate: "<p></p>",
        displayHeaderFooter: false,
        margin: {
            top: "10px",
            bottom: "30px"
        },
        printBackground: true,
        path: pdfPath
    }

    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        headless: true
    });

    var page = await browser.newPage();

    await page.goto(`data:text/html;charset=UTF-8,${html}`, {
        waitUntil: 'networkidle0'
    });

    await page.pdf(options);
    await browser.close();
}

// fs.readFile("./LeaseData.json", "utf8", (err, LeaseData) => {
//   if (err) {
//     console.log("File read failed:", err);
//     return;
//   }
//   console.log(LeaseData);
// });

// const LeaseData = fs.readFile("./LeaseData.json", "utf8", (err, data) => {
//     if (err) {
//         console.log("File read failed:", err);
//         return;
//     }
//     console.log(data);
// });

const LeaseData = {
    LeaseHolders: "Bryce Logue",
    Occupants: "Addisyn",
    TotalOccupants: "2",
    TotalAdults: "1",
    TotalChildren: "1",
    Unit: "5010-201",
    StreetName: "Gerratt Rd",
    PropertyName: "Glen Brook West II",
    PropertyOwner: "Ticon Properties LLC",
    LeaseTerm: "6",
    LeaseStart: "2021-07-15",
    LeaseEnd: "2021-07-16",
    MonthlyRent: "$1,000.00",
    RentTerm: "$12,000.00",
    SecurityDeposit: "$300.00",
    Utilities: "Yes",
    WasherAndDryer: "Included",
    PetType: "1 - Cat",
    PetDeposit: "$200.00",
    ConcessionAmount: "$150.00",
    ConcessionType: "For 12 months"
}

createPDF(LeaseData);