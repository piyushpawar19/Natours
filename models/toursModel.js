const mongoose = require('mongoose');
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim : true,
        maxlength: [50, 'The tour namemust have less than or equal to 50 characters'],
        minlength: [10, 'The tour name must have more than or equal to 10 characters'],
    },
    durations: {
        type: Number,
        // required: [true, 'A tour must have a duration']
    },
    maxGroupSize:{
        type: Number,
        required: [true, 'A tour must have a GroupSize']
    },
    difficulty:{
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum : {
            values :['easy','medium','difficult'],
            messages : 'Difficulty is either easy ,difficult or medium'
        }
    },
    ratingAverage :{
        type: Number,
        default: 4.5,
        min : [1, 'rating must be above 1.0'],
        max : [5, 'rating must be below 5.0'],
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    price:{
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate : {
            validator: function(value) {
                return value<this.price;
            },
            message: 'Discount price ({value}) should be below regular price'
        }
    },
    summery:{
        type: String,
        trim: true,
        // required: [true, 'A tour must have a summery']
    },
    description:{
        type: String,
        trim:true
    },
    imageCover:{
        type:String,
        required: [true, 'A tour must have an cover image']
    },
    images:[String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDate:[Date],
    location:[String]
    
})

//document middleware
tourSchema.pre('save', function(next){
    // console.log(this);
    next();
});

tourSchema.post('save', function(doc, next){
    // console.log(doc);
    next();
});

//query middleware

tourSchema.pre(/^find/,function(next){
    this.find({secretTour : {$ne :true} });
    this.start = Date.now();
    next();
});

tourSchema.post(/^find/,function(docs, next){
    // console.log(`query took ${Date.now()-this.start} milliseconds`);
    // console.log(docs);
    next();
});

// aggregation middleware

tourSchema.pre('aggregate', function(next){
    // console.log(this.pipeline());
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;