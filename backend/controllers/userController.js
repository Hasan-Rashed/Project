const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const sendToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const cloudinary = require('cloudinary');



// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: 'avatars',
        width: 150,
        crop: "scale"
    });


    /* Creating a new user with the name, email, and password from the request body. */
    const { name, email, password } = req.body;



    /* Creating a new user with the name, email, and password from the request body. */
    const user = await User.create({
        name, email, password, // from req.body
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    });


    /* Sending the token to the user. */
    sendToken(user, 201, res);
});




// Login User
/* This is a function that is used to login a user. */
exports.loginUser = catchAsyncErrors(async (req, res, next) => {

    /* Destructuring the email and password from the request body. */
    const { email, password } = req.body;


    /* This is checking if the user has given both the email and password. If not, then it will return
    an error. */
    if (!email || !password) {
        return next(new ErrorHandler('Email and password are required', 400))
    }


    /* Finding a user with the email address that was passed in and then selecting the password property. */
    const user = await User.findOne({ email }).select('+password'); // property value same (email), so write only one email


    /* Checking if the user exists. If not, then it will return an error. */
    if (!user) {
        return next(new ErrorHandler('Invalid credentials', 401))
    }

    /* Comparing the password that the user has given with the password that is stored in the database. */
    const isPasswordMatched = await user.comparePassword(password);

    /* Checking if the password that the user has given matches the password that is stored in the
    database. */
    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password', 401))
    }


    /* Sending the token to the user. */
    sendToken(user, 200, res);
});





// Logout User
exports.logout = catchAsyncErrors(async(req, res, next) => {

    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    })
});



// Forgot Password
/* This is a function that is used to send a reset password token to the user. */
exports.forgotPassword = catchAsyncErrors(async(req, res, next) => {


    /* Finding a user with the email address that was passed in. */
    const user = await User.findOne({ email: req.body.email });


    /* This is checking if the user exists. If not, then it will return an error. */
    if (!user) {
        return next(new ErrorHandler('There is no user with that email address', 404));
    };


    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();

    /* Saving the user without validating the user. */
    await user.save({ validateBeforeSave: false });


    /* Creating a reset password url. ** req.protocol for http or https, req.get('host') for getting hostname */
    // const resetPasswordUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

    
    /* Creating a message that will be sent to the user. */
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it`;

    
    /* If the email is sent successfully, then it will send a response to
    the user. If not, then it will set the resetPasswordToken and resetPasswordExpire to undefined
    and then save the user. */
    try {
        
        await sendEmail({
            email: user.email,
            subject: 'Amar Bazar Password Reset',
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })


    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        /* Saving the user without validating the user. */
        await user.save({ validateBeforeSave: false });

        
        return next(new ErrorHandler(error.message, 500))
    }
});




// Reset Password
/* Creating a hash of the reset password token. */
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash('sha256')

        /* `req.params.token` is getting the token from the url. */
        .update(req.params.token)
        
        .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpire: {$gt: Date.now()} // gt-> greaterThan
        });


        /* This is checking if the user exists. If not, then it will return an
        error. */
        if (!user) {
            return next(new ErrorHandler('Reset Password Token is invalid or has been expired. Please try again!', 400));
        };


        /* This is checking if the password and confirm password are the same. If
        not, then it will return an error. */
        if(req.body.password !== req.body.confirmPassword){
            return next(new ErrorHandler('Password does not match. Please try again!', 400));
        }


        /* Setting the password to the password that the user has given. */
        user.password = req.body.password;

        /* Setting the resetPasswordToken and resetPasswordExpire to undefined. */
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;


        /* Saving the user. */
        await user.save();

        /* Sending the token to the user. */
        sendToken(user, 200, res);
});




// Get User Detail
/* This is a function that is used to get the user details. */
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {

    /* Finding a user with the id that is stored in the token. */
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    });
});




// Update User password
/* This is a function that is used to get the user details. */
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {

/* Finding a user with the id that is stored in the token and then selecting the
password property. */
    const user = await User.findById(req.user.id).select('+password');

/* Comparing the password that the user has given with the password that is stored
in the database. */
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    /* This is checking if the password that the user has given matches the
    password that is stored in the database. */
    if(!isPasswordMatched){
        return next(new ErrorHandler('old password is not matched', 400));
    }


    /* This is checking if the password and confirm password are the same. If not,
    then it will return an error. */
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not match', 400));
    }


/* Setting the password to the new password that the user has given. */
    user.password = req.body.newPassword;

    
/* Saving the user. */
    await user.save();


/* Sending the token to the user. */
    sendToken(user, 200, res);
});




// Update User Profile
/* This is a function that is used to get the user details. */
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {

    /* Creating a new user data object with the name, email, and role from the
    request body. */
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }


    if(req.body.avatar !== ""){
        const user = await User.findById(req.user.id);

        const imageId = user.avatar.public_id;

        /* Deleting the image from the cloudinary. */
        await cloudinary.v2.uploader.destroy(imageId);

        /* This is uploading the image to the cloudinary. */
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        });

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    }
    

    /* This is updating the user with the id that is stored in the token with the
    new user data. */
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });


   /* Sending a response to the user. */
    res.status(200).json({
        success: true
    });
    
});




// Get all users (admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    /* Getting all the users from the database. */
    const users = await User.find();

    /* This is sending a response to the user. */
    res.status(200).json({
        success: true,
        users
    });
});



// Get single user (admin)
/* This is a function that is used to get a single user. */
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    /* This is checking if the user exists. If not, then it will return an error. */
    if(!user){
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    });
});




// Update User Role -- Admin
/* This is a function that is used to get the user details. */
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {

   /* Creating a new user data object with the name, email, and role from the
   request body. */
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }


    /* This is updating the user with the id that is stored in the token with the
    new user data. */
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });


    /* This is checking if the user exists. If not, then it will return an error. */
    if(!user){
        return next(new ErrorHandler(`User role has been updated with id: ${req.params.id}`, 400));
    }


    res.status(200).json({
        success: true
    });
    
});




// Delete User --Admin
/* This is a function that is used to get the user details. */
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {

/* Finding a user with the id that is passed in the url. */
    const user = await User.findById(req.params.id);
    

    /* This is checking if the user exists. If not, then it will return an error. */
    if(!user){
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`, 400));
    }



    const imageId = user.avatar.public_id;

    /* Deleting the image from the cloudinary. */
    await cloudinary.v2.uploader.destroy(imageId);

    
/* Removing the user from the database. */
    await user.remove();


    /* This is sending a response to the user. */
    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });
    
});