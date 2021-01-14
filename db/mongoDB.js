const mongoose = require('mongoose');
const URL = require('../config/URL.config');
console.log(URL.MONGO_DB);
const mongoDBConnection =() =>{
        mongoose.connect(URL.MONGO_DB,{
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() =>{console.log('Connect successful to mongo DB'); })
    .catch(error=>{
        console.log(error);
    });
};

module.exports = mongoDBConnection;