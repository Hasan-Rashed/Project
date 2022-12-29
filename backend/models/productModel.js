const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter Product Name'],
        trim: true,
    },

    description: {
        type: String,
        required: [true, 'Please Enter Product Description']
    },

    price: {
        type: Number,
        required: [true, 'Please Enter Product Price'],
        maxLength: [8, 'Price should be less than 8 digits']
    },

    ratings: {
        type: Number,
        default: 0,
    },

    images: [ // this is array because product has multiple images
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],

    category: {
        type: String,
        required: [true, 'Please Enter Product Category'],
    },

    stock: {
        type: Number,
        required: [true, 'Please Enter Product Stock'],
        maxLength: [4, 'Stock should not exceed 4 digits'],
        default: 1
    },

    numOfReviews: {
        type: Number,
        default: 0
    },

    reviews: [
        {
            user: {
                /* A reference or Id to the user who created the product. */
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],

    user: {
        /* A reference or Id to the user who created the product. */
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
})

/* Product collection or model and productSchema */
module.exports = new mongoose.model('Product', productSchema);