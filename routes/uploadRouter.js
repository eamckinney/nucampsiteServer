const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

//configuration / customization options (we don't HAVE to do this, but we can)
const storage = multer.diskStorage({
    destination: (req, file, cb) => { //cb = callback function
        cb(null, 'public/images'); //1: no error, 2: path to save
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname) //1: no error, 2: use original name from client side
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) { //regex to look for common extensions
        return cb(new Error('You can upload only image files!'), false); // error if not a common file extension
    }
    cb(null, true); // if it IS one of those image file extensions, then no error
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter}); // now configured, stored in "upload"

const uploadRouter = express.Router();

uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
//add multer middleware after admin verification
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => { 
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

module.exports = uploadRouter;