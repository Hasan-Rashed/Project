const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* Used to generate a random token. */
const crypto = require('crypto'); // built-in module



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxLength: [30, 'Name cannot be longer than 30 characters'],
        minLength: [4, 'Name cannot be shorter than 4 characters']
    },
    
    email: {
        type: String,
        required: [true, 'Please provide an email address'],
        unique: true,
        validate: [validator.isEmail, 'Please provide an email address']
    },

    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minLength: [8, 'Password cannot be longer than 8 characters'],
        select: false // should not be returned in response
    },

    avatar: { // is an object cause user has only one avatar
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },

    role: {
        type: String,
        default: 'user' // default to user until make Admin
    },

    createdAt: {
        type: Date,
        default: Date.now()
    },

    resetPasswordToken: String,

    resetPasswordExpire: Date
});





// save is event, before saving userSchema encrypt password
/* Encrypting the password before saving it to the database. */
userSchema.pre('save', async function(next) { // using function keyword, arrow function doesn't support this keyword

    /* Checking if the password is modified or not. If it is not modified, then it will not be hashed
    again. */
    if(!this.isModified('password')) {
        next();
    }
    

/* Encrypting the password before saving it to the database. */
    this.password = await bcrypt.hash(this.password, 10); // 10 is the number of rounds of hashing | 10 character password
});




// JWT TOKEN
/* The above code is creating a method for the userSchema. This method is called getJWTToken. This
method is used to create a JWT token for the user. */
userSchema.methods.getJWTToken = function() {

    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};



// Compare Password
/* This is a method that is used to compare the password that is entered by the user with the
password that is stored in the database. */
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};



// Generating Password Reset Token
/* Generating a random token and hashing it. */
userSchema.methods.getResetPasswordToken = function() {

    /* Generating a random token. */
    const resetToken = crypto.randomBytes(20).toString('hex');


    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

        
    /* Setting the expire time for the token. */
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;


    /* Returning the reset token to the user. */
    return resetToken;
};



/* Exporting the model to be used in other files. */
module.exports = new mongoose.model('User', userSchema);