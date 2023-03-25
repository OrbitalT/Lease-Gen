const {
    app
} = require('electron');
const {
    Client,
    Databases
} = require('appwrite');
const path = require('path');
const fs = require('fs');
const os = require('os');
const pdf = require('html-pdf');
const handlebars = require('handlebars');

const homedir = os.homedir();
const hostname = os.hostname();
const roamingPath = path.join(app.getPath('userData'), 'resources');

async function createLease(leasedata, appwriteProjectID, appwriteDatabaseID, appwriteStorageID) {
    const client = new Client()
        .setEndpoint('https://fqkggzy316.nnukez.com/v1')
        .setProject(appwriteProjectID);

    const databases = new Databases(client);

    try {
        const response = await databases.createDocument(appwriteDatabaseID, '63f28cba281eb44a6d47', hostname, {
            count: 1,
            office: leasedata.Office
        });
        console.log(response);
    } catch (error) {
        console.log(error);

        try {
            const response = await databases.getDocument(appwriteDatabaseID, '63f28cba281eb44a6d47', hostname);

            try {
                const updateResponse = await databases.updateDocument(appwriteDatabaseID, '63f28cba281eb44a6d47', hostname, {
                    count: response.count + 1
                });
                console.log(updateResponse);
            } catch (updateError) {
                console.log(updateError);
            }
        } catch (getError) {
            console.log(getError);
        }
    }

    console.log(leasedata);
    createPDF(leasedata);
}

async function createPDF(leasedata) {
    const desktopDir = `${homedir}/Desktop`;
    let leasepath;

    if (leasedata.Office === 'Glenbrook') {
        if (leasedata.PropertyName === 'Bradford Ridge') {
            leasepath = path.join(roamingPath, 'leases/glenbrook/Bradford');
        } else if (leasedata.PropertyName === 'Dupont Circle') {
            leasepath = path.join(roamingPath, 'leases/glenbrook/Dupont');
        } else {
            leasepath = path.join(roamingPath, 'leases/glenbrook');
        }
    } else {
        leasepath = path.join(roamingPath, 'leases');
    }

    const templateFile = leasedata.PetType === '' ? 'Leasenopet.html' : 'Lease.html';
    const templateHtml = fs.readFileSync(path.join(leasepath, templateFile), 'utf8');

    const template = handlebars.compile(templateHtml);
    const html = template(leasedata);

    const pdfLeasePath = path.join(desktopDir, `${leasedata.LeaseHolders}-${leasedata.Unit}.pdf`);
    const options = {
        format: 'Letter',
        border: '5mm'
    };

    pdf.create(html, options).toFile(pdfLeasePath, (err, res) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(res);
    });
}

module.exports = {
    createLease
};