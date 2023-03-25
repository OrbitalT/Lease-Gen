const {
    app
} = require('electron')
const {
    Client,
    Databases,
    Account,
    Storage
} = require("appwrite")
const path = require('path')
const fs = require('fs');
const homedir = require('os').homedir()
var leasepath = '';
const os = require('os');
const hn = os.hostname();
const roamingPath = path.join(app.getPath('userData'), 'resources');

function createlease(leasedata, appwriteProjectID, appwriteDatabaseID, appwriteStorageID) {

    const client = new Client()
        .setEndpoint('https://fqkggzy316.nnukez.com/v1')
        .setProject(appwriteProjectID);

    const databases = new Databases(client);

    var pdf = require('html-pdf')
    const handlebars = require("handlebars")

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
                leasepath = roamingPath + '/leases/glenbrook/Bradford/'
            } else if (leasedata.PropertyName === 'Dupont Circle') {
                leasepath = roamingPath + '/leases/glenbrook/Dupont/'
            } else {
                leasepath = roamingPath + '/leases/glenbrook/'
            }
        } else {
            leasepath = roamingPath + '/leases/'
        }

        if (leasedata.PetType === '') {
            var templateHtml = fs.readFileSync(path.join(leasepath + "Leasenopet.html"), 'utf8');
        } else {
            var templateHtml = fs.readFileSync(path.join(leasepath + "Lease.html"), 'utf8');
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
}

module.exports = {
    createlease
};