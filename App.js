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

// Connect with database
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true},() => 
    console.log('Connect to DB !')
);

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
app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});