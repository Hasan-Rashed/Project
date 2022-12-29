const express = require('express');
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderController');
const router = express.Router();

/* This is destructuring the isAuthenticateUser and authorizeRoles functions from
the auth.js file. */
const {isAuthenticatedUser, authorizeRoles} = require('../middleware/auth');




/* This is a route `/order/new`. The `isAuthenticatedUser` and `newOrder` are middleware functions that are being called. */
router.route('/order/new').post(isAuthenticatedUser, newOrder);

/* This is a route `/order/:id`. The `isAuthenticatedUser` and `authorizeRoles` are middleware functions that are being called. */
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder);

/* This is a route `/orders/me`. The `isAuthenticatedUser` and `myOrders` are middleware functions that are being called. */
router.route('/orders/me').get(isAuthenticatedUser, myOrders);

/* This is a route `/admin/orders`. The `isAuthenticatedUser` and `authorizeRoles` are middleware functions that are being called. */
router.route('/admin/orders').get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);

/* This is a route `/admin/order/:id`. The `isAuthenticatedUser` and `authorizeRoles` are middleware functions that are being called. */
router
    .route('/admin/order/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

/* This is exporting the router. */
module.exports = router;