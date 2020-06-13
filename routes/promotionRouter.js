const express = require('express');
const bodyParser = require('body-parser');
const Promotion = require('../models/promotion');
const authenticate = require('../authenticate');

const promotionRouter = express.Router();

promotionRouter.use(bodyParser.json());

promotionRouter.route('/')
// get data for ALL of the promotions
.get((req, res, next) => {
    Promotion.find() // query database for ALL documents that were instantiated using the Promotion model
    .then(promotions => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotions); // sends json data to the client in the response stream, automatically close the stream afterward. don't need res.end()
    })
    .catch(err => next(err)); // pass off the error to the overall error handler in the express application; already built
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotion.create(req.body) // create new Promotion document & save to MongoDB server. automatically checks schema.
    .then(promotion => {
        console.log('Promotion Created ', promotion);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    })
    .catch(err => next(err));
})
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403; // not allowed
    res.end('PUT operation not supported on /promotions');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotion.deleteMany() // deletes all promotions in promotions collection (that were instantiated with Promotion model)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

promotionRouter.route('/:promotionId')
.get((req, res, next) => {
    Promotion.findById(req.params.promotionId) //gets parsed from HTTP request from whatever the user on theh client side typed in
    .then(promotion => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403; // not allowed
    res.end(`POST operation not supported on /promotions/${req.params.promotionId}`);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotion.findByIdAndUpdate(req.params.promotionId, { // promotion id
        $set: req.body // update operator
    }, { new: true }) // get back information about updated document as a result of this method
    .then(promotion => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    })
    .catch(err => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotion.findByIdAndDelete(req.params.promotionId) // promotion id
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});


module.exports = promotionRouter;