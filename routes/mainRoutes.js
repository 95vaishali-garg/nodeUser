module.exports = function (app) {
    // importing routes files for routes /////
    var user = require('./userRoute/user');
    app.use('/api/v1/user', user);
    




    // ======================================== End ===================================



};