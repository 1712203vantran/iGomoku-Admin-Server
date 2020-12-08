const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require("http");
const cors = require('cors');
const app = express();
const mongoDBConnnection = require('./db/mongoDB');
const logger = require('morgan');
const configSocketIO = require("./config/SocketIO.Cfg");

const PORT = process.env.PORT || 8000;

//load from .en file
require('dotenv/config');

//socket.io initial  
const server = http.createServer(app);

//socket.io config
const io = require("socket.io")(server, {
    cors: true,
    //origins: ["http://127.0.0.1:3000"],
  });

configSocketIO(io);

// body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// cors
app.use(cors());

//HTTP request(GET, POST, DELETE, PUT ,...) logger middleware 
app.use(logger("dev"));

// Connect with database
mongoDBConnnection();

// Import Routers
const AuthRoute = require('./routers/Auth.R');
const AdminRoute = require('./routers/Admin.R');
const UserRoute = require('./routers/User.R');
const BoardRoute = require('./routers/Board.R');
const SearchRoute = require('./routers/Search.R');
const ErrorRoute = require('./routers/Error.R');
const iGomokuRoute = require('./routers/iGomoku.R');

// Use router
app.use('/auth', AuthRoute);
app.use('/admin', AdminRoute);
app.use('/user', UserRoute);
app.use('/board', BoardRoute);
app.use('/search', SearchRoute);
app.use('/iGomoku', iGomokuRoute);
app.use('/error', ErrorRoute);

// homepage
app.get('/', (req, res) => {
    res.send("Wellcome to iGomoku Admin Server");
});

// run app
server.listen(PORT, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});