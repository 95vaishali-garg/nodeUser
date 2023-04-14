var customer = require('../models/userTable.js');
var jwt = require('jsonwebtoken');

module.exports.validateRoute = async (req, res, next) => {
    var headerData = req.headers;
    var token = headerData.token;

    if (token == config.key.token) {
        return next();
    }
}

module.exports.validateCustomer = async (req) => {

    var customerid = req.customerid;
    var token = req.token;
    console.log('headers customer',req)
    
    if (customerid != undefined && token != undefined) {
        try {
            var myuser = await customer.custAuth({ customerid: customerid, token: token });
            //console.log('myuser=============================',myuser)
            if (myuser != null && myuser.languageDetails != null &&  myuser.languageDetails != '') {
                if (myuser.languageDetails.languageCode != undefined) {
                    req.setLocale(myuser.languageDetails.languageCode);
                }
            }
            return myuser;
        } catch (err) {
            console.log('err',err)
            var myuser = null
            return myuser
        }
    } else {
        var myuser = null
        return myuser;
    }
}

