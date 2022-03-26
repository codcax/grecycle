//Node imports
const path = require('path');
const multer = require('multer');

//Custom imports

//Define constants
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'resourceimage') {
            cb(null, 'src/images/resources');
        } else if (file.fieldname === 'userimage') {
            cb(null, 'src/images/users');
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jgp' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

exports.uploadFile = multer({storage: fileStorage, fileFilter: fileFilter});


