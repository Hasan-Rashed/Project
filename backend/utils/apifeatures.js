/* The ApiFeatures class is a constructor function that takes in a query and a query string and assigns
them to the query and queryStr properties of the class */
class ApiFeatures {
    constructor(query, queryStr) { // query in url is something after ?
        this.query = query;
        this.queryStr = queryStr;
    };




    // search feature in api
    /**
    * If the keyword is not empty, then we will search for the keyword in the name field. If the
    * keyword is empty, then we will return all the documents
    * @returns The query object
    */
    search() {
        const keyword = this.queryStr.keyword ? // ternary operator
        {
            name: {
                // MongoDB Operator       regx: regular expression
                $regex: this.queryStr.keyword,
                $options: 'i' // i means case insensitive (ABC == abc)
            }
        } : 
        {};


        this.query = this.query.find({...keyword});

        return this;
    }





    /**
     * The filter() function is used to filter the products based on the price and rating
     * @returns The query object is being returned.
     */
    filter() {
        const queryCopy = {...this.queryStr}; // spread operator, copy the queryStr object (object stores reference to other variable also changes the original)

        // delete the keyword property from the queryCopy object
        // Removing some fields for category
        const removeFields = ['keyword', 'page', 'limit'];
        removeFields.forEach((key) => delete queryCopy[key]); // for each to remove these



        // ** Filter for price and Rating
        console.log(queryCopy);
        let queryStr = JSON.stringify(queryCopy); // convert the queryCopy object to string
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`); // replace gt, gte, lt, lte with $gt, $gte, $lt, $lte


        // ** this.query = this.query.find(queryCopy) // equals to Product.find() method
        this.query = this.query.find(JSON.parse(queryStr)) // convert queryStr string to object

        console.log(queryStr);
        return this;
    }




    /**
     * The function takes in the number of results per page as an argument, and then it calculates the
     * current page number, and then it calculates the number of results to skip, and then it limits
     * the number of results to the number of results per page, and then it skips the number of results
     * to skip, and then it returns the query
     * @param resultPerPage - the number of results per page
     * @returns The query object.
     */
    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1; // if page is not defined, then currentPage is 1

        const skip = resultPerPage * (currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skip); // query is Product.find() (find all product)

        return this;
    }
};

module.exports = ApiFeatures;