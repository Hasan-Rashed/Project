const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteReview, getAdminProducts } = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');



/* Creating a router object. */
const router = express.Router();


/* Creating a route for the get request. */
router.route('/products').get(getAllProducts);


router.route('/admin/products').get(isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts);



/* Creating a route for the post request. */
router.route('/admin/product/new')
    .post(isAuthenticatedUser, authorizeRoles('admin'), createProduct); // isAuthenticatedUser is to check whether he is admin or not



/* Creating a route for the put and delete request. */
router.route('/admin/product/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct) // isAuthenticatedUser is to check whether he is admin or not
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct) // isAuthenticatedUser is to check whether he is admin or not


/* A route for the get request. */
router.route('/product/:id').get(getProductDetails); // update, delete, productDetails url or api same

/* This is a route for the put request. */
router.route('/review').put(isAuthenticatedUser, createProductReview);

/* This is a route for the get request. */
router
    .route('/reviews')
    .get(getProductReviews)
    .delete(isAuthenticatedUser, deleteReview);


module.exports = router;