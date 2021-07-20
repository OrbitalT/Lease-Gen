// For quick testing of puppeteer gen protion of code (node .\pdf.js)

const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
var pdf = require('html-pdf');
const homedir = require('os').homedir();

async function createPDF(data) {

    const desktopDir = `${homedir}/Desktop`;
    console.log(desktopDir);

    if (data.ConcessionAmount === 'none' && data.PetType === 'none') {

        var templateHtml = fs.readFileSync(path.join(process.cwd(), 'leasenopetnocon.html'), 'utf8');
        var template = handlebars.compile(templateHtml);
        var html = template(data);

        var pdfPath = path.join('pdf', `${data.LeaseHolders}-${data.Unit}.pdf`);

        var options = {
            format: 'Letter',
            border: "5mm"
        };

        pdf.create(html, options).toFile(pdfPath, function (err, res) {
            if (err) return console.log(err);
            console.log(res);
        });

    } else {

        if (data.ConcessionAmount === 'none') {

            var templateHtml = fs.readFileSync(path.join(process.cwd(), 'leasenocon.html'), 'utf8');
            var template = handlebars.compile(templateHtml);
            var html = template(data);

            var pdfPath = path.join('pdf', `${data.LeaseHolders}-${data.Unit}.pdf`);

            var options = {
                format: 'Letter',
                border: "5mm"
            };

            pdf.create(html, options).toFile(pdfPath, function (err, res) {
                if (err) return console.log(err);
                console.log(res);
            });

        } else {

            if (data.PetType === 'none') {

                var templateHtml = fs.readFileSync(path.join(process.cwd(), 'leasenopet.html'), 'utf8');
                var template = handlebars.compile(templateHtml);
                var html = template(data);

                var pdfPath = path.join('pdf', `${data.LeaseHolders}-${data.Unit}.pdf`);

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
                var html = template(data);

                var pdfPath = path.join(desktopDir, `${data.LeaseHolders}-${data.Unit}.pdf`);

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