const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

require('dotenv/config');

// body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// cors
app.use(cors());

// Import Routers
const UserRoute = require('./routers/User.Router');

// Use router
app.use('/users', UserRoute);

mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true},() => 
    console.log('Connect to DB !')
);

app.get('/', (req, res) => {
    res.send("Wellcome to iGomoku Admin Server");
});


app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });