const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./../models/toursModel.js');
const ApiFeatures = require('./../utils/apiFeatures.js');
const AppError = require('../utils/AppError.js');
//const tours =JSON.parse(fs.readFileSync(`${__dirname}/../starter/dev-data/data/tours-simple.json`));

/*
exports.checkID = (req, res, next, value) =>{
    console.log(`Tour id is ${value}`);
    if(req.params.id *1 > tours.length){
        return res.status(404).json({
            status: 'fail',
            message: 'tour not found'
        });
    }
    next();
}

exports.checkBody = (req, res, next) => {
    if(!req.body.name || !req.body.price)
    return res.status(404).json({
        status: 'fail',
        message: 'name and price are required'
    });
    next();
};
*/


exports.aliasing = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = 'name,price,duration,difficulty,ratingAverage';
    next();
};


exports.getAllTours = async (req, res) => {
    // console.log(req.requestTime); 
    // res.status(200).json({
    //      status: 'success',
    //     //  results: tours.lenght ,
    //     //  data: {
    //     //      tours: tours
    //     //  }
    //  });

    try {
    
    // const tours = await Tour.find().where('difficulty').equals('easy');
    // const tours = await Tour.find(req.query)
    
        //filtering

        // const queryOBj = {...req.query};
        // const excludedFields = ['page','sort','limit','fields'];
        // excludedFields.forEach(el => delete queryOBj[el]);

        //sorting
        
        // console.log(req.queryOBj);
        // let query = Tour.find(queryOBj);

        // if(req.query.sort){
        //     const sortBy=req.query.sort.split(',').join(' ');
        //     query = query.sort(sortBy);
        // }

        // fields limiting the query
        
        // if(req.query.fields){
        //         const fields=req.query.fields.split(',').join(' ');
        //         query = query.select(fields);
        // }

        // pagination
        
        // if(req.query.page && req.query.limit){
            // const page=req.query.page *1 ||1;
            // const limit=req.query.limit *1 ||100;
            // const skip = (page-1)*limit;
            // query = query.skip(skip).limit(limit);
        // }

        //execute the query
        const features =new ApiFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();

        const tours = await features.query;

            res.status(200).json({
             status: 'success',
             data: {
                tours
            }

        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: "Invalid data sent",
        });
        console.log(err);
    }
}

exports.getTour = async(req, res) => {
    /*
    console.log(req.params.id);

    const id=req.params.id *1;

    // const tour = tours.find(el => el.id === id);

    //     res.status(200).json({
    //         status:'success',
    //         data: {
    //             tour
    //         }
    //     });
    */

    try {
        const tours = await Tour.findById(req.params.id);

        if(!tours){
            return next(new AppError('No tour found',404));
        }
                res.status(200).json({
                 status: 'success',
                 data: {
                     tours: tours
                 }
                });
        } catch (err) {
            res.status(404).json({
                status: 'fail',
                message: "Invalid id sent",
            });
            console.log(err);
        }
}

exports.createTour = async(req, res) =>{
   
        try {
        const newTour = await Tour.create(req.body); 

        res.status(201).json({
            status:'success',
            data: {
                tour : newTour
            }
        });

    } catch(err) { 
        res.status(400).json({
            status: 'fail',
            message: "Invalid data sent",
        });
        console.log(err);
    }
  
};

exports.updateTour = async(req, res)=>{

    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body,{
            new: true,
            runValidators: true
        });

        if(!tours){
            return next(new AppError('No tour found',404));
        }

                res.status(200).json({
                 status: 'success',
                 data: {
                     tour
                 }
                });
        } catch (err) {
            res.status(404).json({
                status: 'fail',
                message:err
            });
           }
    }

exports.deleteTour = async(req, res)=>{
    
    try {
         const tour = await Tour.findByIdAndDelete(req.params.id);

         if(!tour){
            return next(new AppError('No tour found',404));
        }

                res.status(204).json({
                 status: 'success',
                     data: null
                });
        } catch (err) {
            res.status(404).json({
                status: 'fail',
                message: err
            });
        }
}

exports.getTourStats = async (req, res) => {
    try {

        const stats = await Tour.aggregate([
           {
            $match : { ratingsAverage : { gte : 4.5 } }
           },
           {
            $group : {
                _id : null,
                numRatings :{ $sum : '$ratingQuantity'},
                numTours :{$sum :1},
                avgRating :{ $avg : '$ratingAverage' },
                avgPrice :{ $avg : '$price' },
                minPrice: { $min : '$price'},
                maxPrice: { $max : '$price'},
            }
           },
           {
            $sort : { avgPrice :1}
           }
        ])
        res.status(200).json({
            status: 'success',
                data: {
                   stats
                }
           });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};

exports.getMonthlyPlan = async (req, res) => {

    try {

        const year = req.params.year *1;

        const plan = await Tour.aggregate([
            {
                $unwind :'$startDate'
            },
            {
                $match : {
                    startDate : {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    }
                }
            },
            {
                $group :{
                    _id : { $month : '$startDate'},
                    numTourStarts :{ $sum :1},
                    tours : { $push :'$name'}
                }
            },
            {
                $addFields : { month : '$_id'}
            },
            {
                $project : {
                    _id :0
                }
            },
            {
                $sort : {
                    numTourStarts : -1
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
                data: {
                   plan
                }
           });
    }catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        }); 
    }
};