const mongoose = require("mongoose");

/* Creating a new schema for the order model. */
const orderSchema = new mongoose.Schema({
    /* This is the schema for the order model. */
    shippingInfo: {
        /* Defining the address of the order. */
        address: {
            type: String,
            required: true,
        },

        /* Defining the city of the order. */
        city: {
            type: String,
            required: true,
        },

        /* Defining the state of the order. */
        state: {
            type: String,
            required: true,
        },

        /* Defining the country of the order. */
        country: {
            type: String,
            required: true,
        },

        /* Defining the pin code of the order. */
        pinCode: {
        type: Number,
        required: true,
        },

        /* Defining the phone number of the user who placed the order. */
        phoneNo: {
            type: Number,
            required: true,
        }
  },

    /* This is an array of objects that will be used to store the name, price,
    quantity, image and id of the product that is in the order. */
    orderItems: [
    {
        /* Defining the name of the product that is in the order. */
        name: {
            type: String,
            required: true,
        },

        /* Defining the price of the product that is in the order. */
        price: {
            type: Number,
            required: true,
        },

        /* A field that will be used to store the quantity of the product that is
        in the order. */
        quantity: {
            type: Number,
            required: true,
        },

        /* This is a field that will be used to store the image of the product that
        is in the order. */
        image: {
            type: String,
            required: true,
        },

        /* This is a field that will be used to store the id of the product that is
        in the order. */
        product: {
            type: mongoose.Schema.ObjectId, /* Used to store the id of the product that is in the order. */
            ref: "Product",
            required: true,
        }
    }
],

    /* This is a field that will be used to store the id of the user who placed the
    order. */
    user: {
        type: mongoose.Schema.ObjectId, /* Used to store the id of the product that is in the order. */
        ref: "User",
        required: true,
    },

    /* This is a field that will be used to store the id of the order. */
    paymentInfo: {
        /* This is a field that will be used to store the id of the order. */
        id: {
            type: String,
            required: true,
        },

        /* A field that will be used to store the status of the order. */
        status: {
        type: String,
        required: true,
        },
    },

    /* This is a field that will be used to store the date when the order is paid
    for. */
    paidAt: {
        type: Date,
        required: true,
    },

    /* This is a field that will be used to store the price of the items in the
    order. */
    itemsPrice: {
        type: Number,
        required: true,
        default: 0,
    },

    /* Setting the default value of the taxPrice field to 0. */
    taxPrice: {
        type: Number,
        required: true,
        default: 0,
    },

    /* Setting the default value of the shippingPrice field to 0. */
    shippingPrice: {
        type: Number,
        required: true,
        default: 0,
    },

    /* Setting the default value of the totalPrice field to 0. */
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
    },

    /* Setting the default order status to "Processing". */
    orderStatus: {
        type: String,
        required: true,
        default: "Processing",
    },

    /* A date field that will be used to store the date when the order is delivered. */
    deliveredAt: Date,

  /* Creating a timestamp for the order. */
    createdAt: {
        type: Date,
        default: Date.now,
    }

});

/* Exporting the model to be used in other files. */
module.exports = mongoose.model("Order", orderSchema);