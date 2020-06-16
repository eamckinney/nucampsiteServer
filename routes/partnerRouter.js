const express = require('express');
const bodyParser = require('body-parser');
const Partner = require('../models/partner');
const authenticate = require('../authenticate');
const cors = require('./cors');


const partnerRouter = express.Router();

partnerRouter.use(bodyParser.json());

partnerRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
// get data for ALL of the partners
.get(cors.cors, (req, res, next) => {
    Partner.find() // query database for ALL documents that were instantiated using the Partner model
    .then(partners => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partners); // sends json data to the client in the response stream, automatically close the stream afterward. don't need res.end()
    })
    .catch(err => next(err)); // pass off the error to the overall error handler in the express application; already built
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.create(req.body) // create new Partner document & save to MongoDB server. automatically checks schema.
    .then(partner => {
        console.log('Partner Created ', partner);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403; // not allowed
    res.end('PUT operation not supported on /partners');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.deleteMany() // deletes all partners in partners collection (that were instantiated with Partner model)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

partnerRouter.route('/:partnerId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Partner.findById(req.params.partnerId) //gets parsed from HTTP request from whatever the user on theh client side typed in
    .then(partner => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403; // not allowed
    res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.findByIdAndUpdate(req.params.partnerId, { // partner id
        $set: req.body // update operator
    }, { new: true }) // get back information about updated document as a result of this method
    .then(partner => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.findByIdAndDelete(req.params.partnerId) // partner id
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

module.exports = partnerRouter;