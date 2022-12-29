const express = require('express');
const { registerUser, loginUser, logout, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUser, getSingleUser, updateUserRole, deleteUser } = require('../controllers/userController');

/* This is destructuring the isAuthenticateUser and authorizeRoles functions from
the auth.js file. */
const {isAuthenticatedUser, authorizeRoles} = require('../middleware/auth');


/* Creating a router object. */
const router = express.Router();



/* Creating a route for the register page. */
router.route('/register').post(registerUser);


/* Creating a route for the login page. */
router.route('/login').post(loginUser);


/* This is a route for the forgot password page. */
router.route('/password/forgot').post(forgotPassword);


/* This is a route for the reset password page. */
router.route('/password/reset/:token').put(resetPassword);


/* Creating a route for the logout function. */
router.route('/logout').get(logout);


/* This is a route for the user to get their own details. */
router.route('/me').get(isAuthenticatedUser, getUserDetails);

/* This is a route for the user to update their password. */
router.route('/password/update').put(isAuthenticatedUser, updatePassword);


/* This is a route for the user to update their profile. */
router.route('/me/update').put(isAuthenticatedUser, updateProfile);

/* This is a route for the admin to get all the users. */
router
    .route('/admin/users')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getAllUser);


/* This is a route for the admin to get a single user. */
router
    .route('/admin/user/:id')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getSingleUser)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateUserRole)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

module.exports = router;