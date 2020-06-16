const cors = require('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin'));
    if(whitelist.indexOf(req.header('Origin')) !== -1) { // -1 if item is not found
        corsOptions = { origin: true }; // can an origin be found in the whitelist? yes! we're allowing this request to be accepted
    } else {
        corsOptions = { origin: false }; // if no origin is found, then don't allow
    }
    callback(null, corsOptions);
};

exports.cors = cors(); // returns middleware, sends a header of Access-Control-Allow-Origin on response option with wildcard as its value, so will allow all origins
exports.corsWithOptions = cors(corsOptionsDelegate); // returns middleware, will check whitelisted origins, if it matches, THEN sends header of Access-Contorl-Allow-Origin with whitelisted origin as value