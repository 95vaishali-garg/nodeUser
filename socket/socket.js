// module.exports = function (http, app) {

//   var io = require('socket.io')(http);
//   const redisAdapter = require('socket.io-redis');
//   // io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));
//   app.set('socketio', io);

//   var User = require('../models/userTable');
  
  
//   var Chat = require('../models/realTable');
 
  
//   // const momnet = require()

//   //all socket listent request
//   io.on('connection', function (socket) {

//     require('./userSocket')(socket);
    

//     socket.on("sendMessage", function (data, acknowledgement) {
     
//       Chat.addChat(data, async (err, chatdata) => {
//         if (err) {
//           var messageData = {
//             success: false,
//             msg: data.msg,
//             userId: null,
          
            
//             currentTime: data.currentTime || "",
//             day: data.day || ""
//           }
//           acknowledgement(messageData)
//         } else {
//           console.log("== chat data=============", chatdata);
//           var SendTouser = await User.getUserByIdAsync(chatdata.userId);
//           var messageData = {
//             msg: data.msg,
//             userId: chatdata.userId,
           
            
//             currentTime: data.currentTime || "",
//             day: chatdata.day || ""
//           }
//           // success acknowledgement starts
//           let response = {
//             status: "success",
//             message: "message sent",
//             data: messageData,
//             error: {}
//           }
        
          
//           console.log("SendTouser", SendTouser)
//           if (SendTouser != null) {
//             if (SendTouser.socketStatus === "yes") {
//               io.sockets.to(SendTouser.socketId).emit("newMessage", messageData);
//               console.log("messageData", messageData)
            
//             }
//           }
         
          
          
//           Message.addMessage(messageData, (err, resdata) => {
//             if (err || resdata == null) {
//               console.log("resdata err", err);
//             } else {
//               console.log("resdata success", resdata);
//             }
//           });
//         }
//       });
//     });

//     socket.on('disconnect', function (reason) {
//       //console.log("Reason Disconnect", reason);
//       console.log('A user disconnected ' + socket.type);
//       console.log('Check socket id id id =======', socket.id);

//       if (socket.type === "user") {

//         User.removeSocketuser(socket.id, (err, call) => {
//           if (err) {
//             //console.log("user socket error");
//           }
//           //console.log("call", call);
//         })
//       }

     


//     });
//   });
// }