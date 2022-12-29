const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');



const errorMiddleware = require('./middleware/error')


// config
/* Loading the config.env file. */
dotenv.config({path: 'backend/config/config.env'});

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

// Route Imports
const product = require('./routes/productRoute');
const user = require('./routes/userRoute');
const order = require('./routes/orderRoute');
const payment = require('./routes/paymentRoute');


/* Telling the app to use the product route. */
app.use('/api/v1', product);


/* Telling the app to use the user route. */
app.use('/api/v1', user);

/* Telling the app to use the order route. */
app.use('/api/v1', order);


app.use('/api/v1', payment);

/* Error Handling Middleware */
app.use(errorMiddleware);



// exporting app module to use on server.js
module.exports = app;