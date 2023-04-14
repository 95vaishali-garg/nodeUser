const express = require('express');
const router = express.Router();
const usercontroller = require('../../controller/userController.js');

//get all users
router.get('/', usercontroller.getUsersList);

router.post('/register', usercontroller.userRegister);

router.post('/login', usercontroller.userLogin);
router.post('/logout', usercontroller.userLogout);


router.get('/profile', usercontroller.getUserProfileById);


// user everything
router.get('/everything', usercontroller.userEverything);
router.post('/addItems',usercontroller.addListItem)
router.post('/updateItms',usercontroller.editListItem)

router.post('/Items',usercontroller.ListItemByUserId)

module.exports = router;