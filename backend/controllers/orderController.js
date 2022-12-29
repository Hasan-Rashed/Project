const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');



// Create new Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {

    /* Destructuring the req.body object. */
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      } = req.body;
      

    /* Creating a new order. */
    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
      });
    

    res.status(201).json({
        success: true,
        order /* `order` is a variable that is storing the newly created order and sending as respond. */
    })
});




// get single order
/* This is a function that is getting a single order. */
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {

    /* Populating the user field in the order model with the name and email of the
    user. */
    const order = await Order.findById(req.params.id).populate( /* Populating the user field in the order model with the name and email of the user. */
        'user',
        'name email'
    );

    /* If the order is not found, it will return an error message. */
    if(!order){
        return next(new ErrorHandler('Order not found with this id', 404))
    }

   /* Sending the order as a response. */
    res.status(200).json({
        success: true,
        order
    });
});




// get logged in user orders
/* This is a function that is getting all the orders of the logged in user. */
exports.myOrders = catchAsyncErrors(async (req, res, next) => {

    /* Finding the order by the user id. */
    const orders = await Order.find({ user: req.user._id }); /* Getting the user id from the request and using it to find the order. */


   /* Sending the order as a response. */
    res.status(200).json({
        success: true,
        orders
    });
});




// get all orders --Admin
/* This is a function that is getting all the orders in the database. */
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {

    /* Finding all the orders in the database. */
    const orders = await Order.find(); /* Finding all the orders in the database. */

    /* A variable that is storing the total amount of all the orders. */
    let totalAmount = 0;


    /* Looping through all the orders and adding the total price of each order to
    the totalAmount variable. */
    orders.forEach(order => {
        totalAmount += order.totalPrice;
    });

   /* Sending the order as a response. */
    res.status(200).json({
        success: true,
        totalAmount,
        orders
    });
});




// Update Order Status --Admin
/* This is a function that is updating the order status. */
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {

    /* Finding the order by the id. */
    const order = await Order.findById(req.params.id); /* Finding the order by the id. */


    /* This is checking if the order is found. If it is not found, it will return an error message. */
    if(!order){
        return next (new ErrorHandler('Order not found with this id.', 404));
    }

    
    /* This is checking if the order status is delivered. If it is, it will return
    an error message. */
    if(order.orderStatus === 'Delivered'){
        return next(new ErrorHandler('You have already received this order', 400));
    }

    
    if(req.body.status === 'Shipped'){
        order.orderItems.forEach(async (o) => {
            await updateStock(o.product, o.quantity);
        });
    }

    /* Updating the order status. */
    order.orderStatus = req.body.status;

    /* This is checking if the order status is delivered. If it is, it will return an error message. */
    if(req.body.status === 'Delivered'){
        order.deliveredAt = Date.now();
    }

    /* This is saving the order without validating the fields. */
    await order.save({ validateBeforeSave: false });
    
   /* Sending the order as a response. */
    res.status(200).json({
        success: true,
    });
});



/**
 * It finds a product by its id, subtracts the quantity from the stock, and saves
 * the product without validating the fields
 * @param id - The id of the product.
 * @param quantity - The quantity of the product that the user wants to buy.
 */
async function updateStock(id, quantity){
    /* Finding the product by the id. */
    const product = await Product.findById(id);

    /* Subtracting the quantity from the stock. */
    product.stock -= quantity;

    /* This is saving the product without validating the fields. */
    await product.save({ validateBeforeSave: false });
};




// delete order --Admin
/* This is a function that is deleting an order. */
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {

    /* Finding the order by the id. */
    const order = await Order.findById(req.params.id);

   /* This is checking if the order is found. If it is not found, it will return an error message. */
    if(!order){
        return next (new ErrorHandler('Order not found with this id.', 404));
    }
    
    /* Removing the order from the database. */
    await order.remove();

   /* Sending the order as a response. */
    res.status(200).json({
        success: true,
    });
});