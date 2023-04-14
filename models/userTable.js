var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    name: { type: String, required: true },
    
    email: { type: String },
    password: { type: String },
    token: { type: String },
   
   status:{ type: String, enum: ["active", "inactive"], default: 'inactive'},
    createdAt: { type: Date },
    UpdatedAt: { type: Date },
   
    
},
    {
        versionKey: false // You should be aware of the outcome after set to false
    });


const User = module.exports = mongoose.model('User', userSchema);

//get all users
module.exports.getUsers = function (callback, limit) {
    User.find(callback).limit(limit);
}




module.exports.getUsersWithFilter = function (obj, sortByField, sortOrder, paged, pageSize, callback) {
    User.aggregate([{ $match: obj },
    
    { $sort: { [sortByField]: parseInt(sortOrder) } },
    { $skip: (paged - 1) * pageSize },
    { $limit: parseInt(pageSize) },
    ], callback);
}


//add user 
module.exports.addUser = function (data, callback) {
    console.log("register Data====>".data);
    var query = {};
    if (data.email) {
        query.email = data.email
    }

   

   
    User.findOneAndUpdate(query, data, { upsert: true, new: true }).lean().exec(callback)
}




//edit user profile
module.exports.getUserById = (id, callback) => {
    User.findById(id,"-clientSecret", callback);
}

module.exports.getUserByIdAsync = (id, callback) => {
    return User.findById(id, callback);
}


//get user by email
module.exports.getUserByEmail = (data, callback) => {
    var query = { email: data.email };
    return User.findOne(query, callback);
}

// Updating user
module.exports.updateUser = (id, data, options, callback) => {
    var query = { _id: id };
    var update = {
        firstName: data.firstName,
        lastName: data.lastName,
        profileImage: data.profileImage,
    }
    update.updatedAt = new Date(); // change it later
    return User.findOneAndUpdate(query, update, { fields: { password: 0 } }, callback);
}

// Updating user
module.exports.updateToken = (data, callback) => {
    console.log("dataToken",data)
    var query = { email:data.email};
    var update = {
        token: data.token,
       status:"active"
    }
    update.updatedAt = new Date(); // change it later
    return User.findOneAndUpdate(query, update, { fields: { password: 0 } }, callback);
}



module.exports.logoutCustomer = (userId, callback) => {
    var query = { _id: userId };
    var update = {
        $unset: {
            token: "",
        },
        updatedAt: new Date()
    }
    return User.findOneAndUpdate(query, update, { "fields": { password: 0, }, "new": true }, callback);
}

module.exports.updateUsers = (data, callback) => {
    var query = { _id: data.userId };
    var update = {
        name: data.name,
        email: data.email,
      
        updatedAt: new Date()
    }
    if (data.password) {
        update.password = data.password
    }

    return User.findOneAndUpdate(query, data, { "fields": { password: 0}, "new": true }, callback);
}

module.exports.custAuth = (data) => {
    return User.findOne({ _id: data.customerid, token: data.token });
}
