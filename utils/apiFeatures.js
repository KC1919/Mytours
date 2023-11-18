class APIFeatures {
    constructor(query, queryStr) {
        this.query = query; //Query Model eg. Tour.find() or User.find()
        this.queryStr = queryStr; //req.query object
    }

    filter() {
        //1. FILTERING
        let queryObj = {
            ...this.queryStr,
        };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        //2. ADVANCE FILTERING
        let queryStr = JSON.stringify(queryObj);

        //adding dollar sign in front of filter queries, like gte, lt, lte, gte
        //these if exists will become, $gt, $gte, $lt, $lte, so that it can be
        //passed as query parameter as mongoose query
        queryStr = queryStr.replace(
            /\b(lte|gte|gt|lt)\b/g,
            (match) => `$${match}`
        );

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        let sortBy;

        //if sort option is present as a query parameter, then rebuild the query with
        //appropriate sort options

        if (this.queryStr.sort) {
            sortBy = this.queryStr.sort.split(',').join(' ');
            // console.log(sortBy);
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        if (this.queryStr.fields) {
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        const page = this.queryStr.page * 1 || 1;
        const limit = this.queryStr.limit * 1 || 100;
        const skipCount = (page - 1) * limit;

        this.query = this.query.skip(skipCount).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;