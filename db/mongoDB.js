const mongoose = require('mongoose');

const mongoDBConnection =() =>{
        mongoose.connect(process.env.DB_CONNECTION,{
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() =>{console.log('Connect successful to mongo DB'); })
    .catch(error=>{
        console.log(error);
    });
}
   
module.exports = mongoDBConnection;