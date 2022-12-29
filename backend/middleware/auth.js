const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const jwt_decode = require('jwt-decode')


/* This is a middleware function that checks if the user is authenticated. */
exports.isAuthenticatedUser = catchAsyncErrors( async(req, res, next) => {
    

/* Destructuring the token from the cookies. */
    const { token } = req.cookies;

    /* If there is no token, then the user is not authenticated. */
    if(!token) {
        return next(new ErrorHandler('Please Login to access this resource.', 401));
    }

    /* Decoding the token. */
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    
    /* Decoding the token. using jwt_decode library */
    // const decodedData = jwt_decode(token);


    /* Finding the user in the database using the id that was decoded from the token. */
    req.user = await User.findById(decodedData.id); // contains users all data
    

    /* Calling the next callback function. */
    next();
});





exports.authorizeRoles = (...roles) => { // (argument is admin) ...roles is a array

    return (req, res, next) => {
        
        /* Checking if the user role is included in the roles array. ** array.includes() */
        if(!roles.includes(req.user.role)) { // role is user or admin (req.user returns the user details and .role return role of user)

            return next(
                new ErrorHandler(`Role: ${req.user.role} is not authorized to access this resource.`, 403)
            );
        }

        next(); // skip to the next middleware function
    }
}