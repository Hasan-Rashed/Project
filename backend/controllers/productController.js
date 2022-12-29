const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ApiFeatures = require('../utils/apifeatures');
const cloudinary = require('cloudinary');




// Create Product -- Admin
/* catchAsyncErrors A middleware function that is used to handle errors of async functions. */

exports.createProduct = catchAsyncErrors(async (req, res, next) => {

    let images = [];

    if(typeof req.body.images === 'string'){
        images.push(req.body.images);
    }
    else{
        images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++){
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }

    req.body.images = imagesLinks;
    
    /* Adding the user id to the product. */
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    });
});





// GET All Products
/* catchAsyncErrors A middleware function that is used to handle errors of async functions. */

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    // module apifeatures is used to filter the products

    /* Used to get the number of products that will be displayed on a page. */
    const resultPerPage = 8;
    /* Used to get the number of products in the database. */
    const productsCount = await Product.countDocuments();
    console.log('Total products: ', productsCount);


    
    /* Filtering the products based on the query string. */
    const apiFeature = new ApiFeatures(Product.find(), req.query) // query and queryStr parameter
    .search() // search feature function
    .filter() // filter feature function

/* Getting the products from the database. */
    let products = await apiFeature.query;

/* Used to get the number of products that are filtered. */
    let filteredProductsCount = products.length;

/* Used to paginate the products. */
    apiFeature.pagination(resultPerPage) // pagination feature function
    
    /* Getting the products from the database. */
    products = await apiFeature.query;
    
    /* Sending a response to the client. */
    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount
    });
});



// Get all product (Admin)
/* Used to get all the products in the database. */
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
    const products = await Product.find()
    
    /* Sending a response to the client. */
    res.status(200).json({
        success: true,
        products,
    });
});




// GET Product details
/* catchAsyncErrors A middleware function that is used to handle errors of async functions. */

exports.getProductDetails = catchAsyncErrors(catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    // error handling
    if(!product) {
        return next(new ErrorHandler('Product not found', 404)); // next is a callback function
    }

    res.status(200).json({
        success: true,
        product,
    })
}));




// Update Product -- Admin
/* catchAsyncErrors A middleware function that is used to handle errors of async functions. */

exports.updateProduct = catchAsyncErrors(async (req, res, next) => { 

/* Finding the product by the id. */
    let product = await Product.findById(req.params.id);

    // error handling
    /* This is an error handling function. */
    if(!product) {
        return next(new ErrorHandler('Product not found', 404)); // next is a callback function
    }


 
  // Images Start Here
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }


  
    /* This is a function that is used to update a product. */
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

   /* Sending a response to the client. */
    res.status(200).json({
        success: true,
        product
    });
});




// Delete Product -- Admin
/* This is a function that is used to delete a product. */
exports.deleteProduct = async (req, res, next) => {

/* Finding the product by the id. */
    let product = await Product.findById(req.params.id);

    // error handling
    if(!product) {
        return next(new ErrorHandler('Product not found', 404)); // next is a callback function
    }


    // Deleting Images from cloudinary
    for (let i = 0; i < product.images.length; i++) {
/* Used to delete the images of a product from cloudinary. */
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

/* Deleting the product. */
    await product.remove();

    /* Sending a response to the client. */
    res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
    });
};




// Create new review or update the review for a product.
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {

    /* Destructuring the req.body. */
    const {rating, comment, productId} = req.body;

    /* Creating a review object. */
    const review = {
        user: req.user._id, /* Getting the user id from the user model. */
        name: req.user.name, /* Getting the name of the user from the user model. */
        rating: Number(rating), /* Converting the rating to a number. */
        comment
    };

    /* Finding the product by the id. */
    const product = await Product.findById(productId);

    /* Checking if the user has already reviewed the product. */
    const isReviewed = product.reviews.find(
        (review) => review.user.toString() === req.user._id.toString() /* `review.user` is a reference to the user id. */
    );

    /* Updating the review. */
    if(isReviewed){
        /* Looping through the reviews array. */
        product.reviews.forEach(review => {

            if(review.user.toString() === req.user._id.toString()) /* `review.user` is a reference to the user id. */

            /* Updating the review and comment */
            review.rating = rating,
            review.comment = comment;
        });
    }
    
    /* Pushing the review into the product.reviews array. */
    else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }


    let avg = 0;

    /* Looping through the reviews array and adding the rating of each review to
    the avg variable. */
    product.reviews.forEach(review => {
        avg += review.rating
    });

   /* Calculating the average rating of the product. */
    product.ratings = avg / product.reviews.length;


    /* Used to save the product without validating the product. */
    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success: true
    })
});





// Get all reviews of a product
/* A function that is used to get all the reviews of a product. */
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    /* Finding the product by the id. */
    const product = await Product.findById(req.query.id);

   /* An error handling function. */
    if(!product){
        return next(new ErrorHandler('Product not found', 404)); // next is a callback function
    }

    /* Sending a response to the client. */
    res.status(200).json({
        success: true,
        reviews: product.reviews
    });
});




// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
     /* Finding the product by the id. */
     const product = await Product.findById(req.query.productId);

     /* An error handling function. */
    if(!product){
        return next(new ErrorHandler('Product not found', 404)); // next is a callback function
    }


    /* Filtering the reviews array and returning the reviews that do not have the
    same id as the id of the review that is to be deleted. */
    const reviews = product.reviews.filter(
        review => review._id.toString() !== req.query.id.toString() /* `review._id` is a reference to the id of the review. */
    );

    let avg = 0;

    /* Looping through the reviews array and adding the rating of each review to
    the avg variable. */
    reviews.forEach(review => {
        avg += review.rating
    });

    let ratings = 0;

    if(reviews.length === 0){
        ratings = 0;
    }
    else{
        /* Calculating the average rating of the product. */
        ratings = avg / reviews.length;
    }

    /* Used to get the number of reviews of a product. */
    const numOfReviews = reviews.length;

    /* Updating the product with the new reviews, ratings and numOfReviews. */
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    },
    {
        /* Used to update the product without validating the product. */
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    /* Sending a response to the client. */
    res.status(200).json({
        success: true
    });
});