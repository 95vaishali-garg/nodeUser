var mongoose = require('mongoose');

var customerSocketSchema = mongoose.Schema({
    userId:       {type: String},
    itemName :    {type: String},
    isMarked:Boolean,
    price:{type:Number},
    createdAt:    {type: Date},
    updatedAt:{type:Date}
   
})

const SCsch = module.exports =  mongoose.model('listData' , customerSocketSchema);

module.exports.addItem = function(data, callback){
    
    data.createdAt=new Date()
    SCsch.create(data,callback);
}


module.exports.updateItems= (data, callback) => {
    var query = { _id: data.itemId };
    var update = {
       isMarked:data.isMarked,
      
        updatedAt: new Date()
    }
   

    return SCsch.findOneAndUpdate(query, update, callback);
}
module.exports.getlistWithFilter = function (obj, sortByField, sortOrder, paged, pageSize, callback) {
    SCsch.aggregate([{ $match: obj },
    
    { $sort: { [sortByField]: parseInt(sortOrder) } },
    { $skip: (paged - 1) * pageSize },
    { $limit: parseInt(pageSize) },
    ], callback);
}