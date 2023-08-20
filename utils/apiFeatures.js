class ApiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString ;
    }

    filter(){
        const queryOBj = {...this.queryString};
        const excludedFields = ['page','sort','limit','fields'];
        excludedFields.forEach(el => delete queryOBj[el]);

        // let query = Tour.find(queryOBj);
        this.query=this.query.find(queryOBj);

        return this;
    }

    sort(){
        if(this.queryString.sort){
            const sortBy=this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }

        return this;
    }

    limitFields(){
        if(this.queryString.fields){
            const fields=this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
    }

    return this;
    }

    paginate(){
        const page=this.queryString.page *1 ||1;
        const limit=this.queryString.limit *1 ||100;
        const skip = (page-1)*limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }

};

module.exports = ApiFeatures;