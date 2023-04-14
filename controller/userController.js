const User = require('../models/userTable.js');

const mongoose = require('mongoose');


const jwt = require('jsonwebtoken');

const authroute = require('../middleware/auth.js');

const request = require('request')
var moment = require('moment-timezone');
const Moment = require('moment');
const listModel=require('../models/listTable.js')
const ObjectId = require('objectid');
const headers = require('../helper/helper');



const validator = require('validator');


module.exports = {



    getUsersList: async (req, res) => {
        try {
            User.getUsers((err, resdata) => {
                if (err) {
                    return res.status(500).json(helper.showDatabaseErrorResponse("INTERNAL_DB_ERROR", err));
                } else {
                    if (resdata.length === 0) {
                        res.json(helper.showSuccessResponse('NO_DATA_FOUND', []));
                    } else {
                        res.json(helper.showSuccessResponse('DATA_SUCCESS', resdata));
                    }
                }
            });
        }
        catch (err) {
            res.status(500).json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },
   

    userLogout: async (req, res) => {
        try {
            var verifydata = await authroute.validateCustomer(req.headers)
            if (verifydata == null) {
                return res.status(401).json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
            }

            User.logoutCustomer(verifydata._id, function (err, response) {
                if (err) {
                    console.log('errr', err)
                } else {
                    return res.json(helper.showSuccessResponse('USER_LOGOUT_SUCCESSFULLY'));
                }
            })
        } catch (err) {
            console.log('err', err)
            return res.status(500).json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },

    userRegister: async (req, res) => {
        try {
            var data = req.body;




            if (!data.password) {
                return res.status(400).json(helper.showValidationErrorResponse('PASSWORD_IS_REQUIRED'));
            }


            if (!data.email) {
                return res.status(400).json(helper.showValidationErrorResponse('EMAIL_IS_REQUIRED'));
            }
            if (!data.name) {
                return res.status(400).json(helper.showValidationErrorResponse('NAME_IS_REQUIRED'));
            }

            let checkEmail = await User.findOne({ email: data.email });
            if (checkEmail) {
                return res.json(helper.showValidationErrorResponse('EMAIL_ID_ALREADY_EXIST'));
            }

            if (!validator.isEmail(data.email)) {
                return res.json(helper.showValidationErrorResponse('EMAIL_INVALID'));
            }




            var hashedPassword = require('crypto').createHash('sha256').update(data.password).digest('hex');
            console.log('data.password', hashedPassword)
            var userd = {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                token: ""
            }


            User.addUser(userd, async (err, user) => {
                if (err) {
                    return res.status(400).json(helper.showValidationErrorResponse('USER_REGISTER'));
                } else {



                    return res.json(helper.showSuccessResponse('USER_REGISTERED_SUCCESS', user));

                }
            });



        } catch (error) {
            console.log("check reporpr", error);
            return res.status(500).json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },
    userUpdateProfile: async (req, res) => {
        try {
            var data = req.body;

            var verifydata = await authroute.validateCustomer(req.headers);
            if (verifydata == null) {
                return res.status(401).json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
            }



            if (!data.email) {
                return res.status(400).json(helper.showValidationErrorResponse('EMAIL_IS_REQUIRED'));
            }

            if (!validator.isEmail(data.email)) {
                return res.json(helper.showValidationErrorResponse('EMAIL_INVALID'));
            }
            var checkEmail = await User.findOne({ email: data.email, _id: { $ne: verifydata._id } });
            if (checkEmail) {
                return res.status(400).json(helper.showValidationErrorResponse('EMAIL_ALREADY_EXIST'));
            }



            data._id = verifydata._id;
            console.log("data ====> ", data)
            var updateProfile = await User.updateUserProfile(data);

            res.json(helper.showSuccessResponse('PROFILE_UPDATE_SUCCESS', updateProfile));
        }
        catch (error) {
            console.log("chgeck error ", error);
            return res.status(500).json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },
    userLogin: async (req, res) => {
        try {
            var data = req.body;
            if (!data.password) {
                return res.status(400).json(helper.showValidationErrorResponse('PASSWORD_IS_REQUIRED'));
            }

            if (!data.email) {
                return res.status(400).json(helper.showValidationErrorResponse('EMAIL_IS_REQUIRED'));
            }
            console.log('Login Data', data);

            var email = data.email;
            var userc = await User.findOne({ email: email});
            try {
                var hashedPassword = require('crypto').createHash('sha256').update(data.password).digest('hex');
            } catch (err) {
                console.log('crypto support is disabled!');
            }

            if (userc === null) {
                // console.log('null user')
                var resData = {
                    "status": "failure",
                    "error_description": "Validation Error!",
                    "message": 'This user does not exist!',
                    "data": {},
                    "error": {}
                };
                return res.status(400).json(resData);
            }

           
            if (userc != null && hashedPassword === userc.password) {

                userc.token = jwt.sign(
                    {
                        email: userc.email,
                        userId: userc._id
                    },
                    'secret',
                    {
                        expiresIn: "2h"
                    }
                );

                var mytoken = await User.updateToken(userc);
                 console.log('mytoken',mytoken)
                return res.json(helper.showSuccessResponse('LOGIN_SUCCESS', mytoken));
            } else {
                // console.log('null user')
                var resData = {
                    "status": "failure",
                    "error_description": "",
                    "message": __("INVALID_LOGIN_CREDENTIALS"),
                    "data": {},
                    "error": {}
                };
                return res.status(400).json(resData);
            }

        }
        catch (err) {
            console.log('err', err)
            res.status(500).json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },
    getUserProfileById: async (req, res) => {
        try {
            // console.log('here')
            var verifydata = await authroute.validateCustomer(req.headers);
            //console.log("verifydata :",verifydata);

            if (verifydata == null) {
                return res.status(401).json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
            }

            User.getUserById(verifydata._id, (err, user) => {
                if (err) {
                    console.log('err', err)
                    return res.status(400).json(helper.showDatabaseErrorResponse("INTERNAL_DB_ERROR", err));
                } else {
                    // console.log('user',user)
                    if (user == null) {
                        return res.json(helper.showValidationErrorResponse('NO_DATA_FOUND'));
                    }

                    res.json(helper.showSuccessResponse('DATA_SUCCESS', user));
                    // return res.json({
                    //     data:data,
                    //     message:"success"
                    // });
                }
            });
        } catch (err) {
            console.log('err', err)
            return res.status(500).json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },
    
    userEverything: async (req, res) => {
        try {
            // console.log('here')
            var verifydata = await authroute.validateCustomer(req.headers);
            //console.log("verifydata :",verifydata);

            if (verifydata == null) {
                return res.status(401).json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
            }

            User.getUserById(verifydata._id, (err, user) => {
                if (err) {
                    console.log('err', err)
                    return res.status(400).json(helper.showDatabaseErrorResponse("INTERNAL_DB_ERROR", err));
                } else {
                    // console.log('user',user)
                    if (user == null) {
                        return res.json(helper.showValidationErrorResponse('NO_DATA_FOUND'));
                    }

                    res.json(helper.showSuccessResponse('DATA_SUCCESS', user));
                    // return res.json({
                    //     data:data,
                    //     message:"success"
                    // });
                }
            });
        } catch (err) {
            console.log('err', err)
            return res.status(500).json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },
// add items
addListItem: async (req, res) => {
    try {
        var data = req.body;


        var verifydata = await authroute.validateCustomer(req.headers);
       

        if (verifydata == null) {
            return res.status(401).json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
        }

        if (!data.itemName) {
            return res.status(400).json(helper.showValidationErrorResponse('itemName_IS_REQUIRED'));
        }


        if (!data.price) {
            return res.status(400).json(helper.showValidationErrorResponse('price_IS_REQUIRED'));
        }
        data.userId=(verifydata._id).toString()
     listModel.addItem(data, async (err, item) => {
            if (err) {
                return res.status(400).json(helper.showValidationErrorResponse('USER_REGISTER'));
            } else {
                return res.json(helper.showSuccessResponse('ITEM_ADD_SUCCESS', item));

            }
        });
    } catch (error) {
        console.log("check reporpr", error);
        return res.status(500).json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
    }
},
ListItemByUserId: async (req, res) => {
    try {
        // console.log('here')
        let data=req.body
        let pageSize=data.pageSize||10
        let paged=data.page||1
        let sortOrder=data.sort||-1
        let sortByField=data.sortBy||"createdAt"
        let obj={}
        var verifydata = await authroute.validateCustomer(req.headers);
        console.log("verifydata :",verifydata);
       
        if (verifydata == null) {
            return res.status(401).json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
        }
        if(data.search){
        obj.itemName={
            $regex: data.search || "",
            $options: "i"
        };
        }
        listModel.getlistWithFilter(obj, sortByField, sortOrder, paged, pageSize, async (err, item) => {
            if (err) {
                console.log(err)
                return res.status(400).json(helper.showValidationErrorResponse('Not_Found'));
            } else {
                return res.json(helper.showSuccessResponse('ITEM_ADD_SUCCESS', item));

            }
        });
    } catch (err) {
        console.log('err', err)
        return res.status(500).json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
    }
},
editListItem: async (req, res) => {
    try {
        var data = req.body;


        var verifydata = await authroute.validateCustomer(req.headers);
       

        if (verifydata == null) {
            return res.status(401).json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
        }

        if (!data.itemId) {
            return res.status(400).json(helper.showValidationErrorResponse('itemId_IS_REQUIRED'));
        }


       
       
     listModel.updateItems(data,  (err, item) => {
            if (err) {
                console.log(err)
                return res.status(400).json(helper.showValidationErrorResponse('ITEM_MARKED_AND_UNMARKED'));
            } else {
                return res.json(helper.showSuccessResponse('ITEM_marked/unmarked_SUCCESS', item));

            }
        });
    } catch (error) {
        console.log("check reporpr", error);
        return res.status(500).json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
    }
},
}


