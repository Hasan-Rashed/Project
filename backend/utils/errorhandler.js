class ErrorHandler extends Error {
    constructor(message, statusCode) { // productController error status code and message
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorHandler;