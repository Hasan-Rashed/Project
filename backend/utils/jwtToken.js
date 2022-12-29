/**
 * The function takes in a user object, a status code, and a response object. It then calls the
 * getJWTToken() method on the user object, sets the cookie to expire in 24 hours, sets the status
 * code, sets the cookie, and sends the response
 * @param user - The user object that we want to send back to the client.
 * @param statusCode - The status code to send with the response.
 * @param res - The response object.
 */



// create token and save it to cookie
const sendToken = (user, statusCode, res) => {
  
    /* Calling the method getJWTToken() on the user object. */
    const token = user.getJWTToken();


    // options for cookie
    /* Setting the cookie to expire in 24 hours. */
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // 24 hours in minutes * 60 minutes * 60 seconds * 1000 milliseconds
        ),
        httpOnly: true
    };


    /* Setting the status code, setting the cookie, and sending the response. */
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token
    });
};

module.exports = sendToken;