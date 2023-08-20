const fs = require('fs');
const mongoose = require('mongoose');
const User = require('./../models/userModel.js');
const ApiFeatures = require('./../utils/apiFeatures.js');
const AppError = require('./../utils/AppError.js');

const filterObj = (obj, ...allowedFields) => {

    const newObj = {};

    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)){
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

exports.getAllUser = async (req, res, next) => {
    try{
        const user = await User.find();

            res.status(200).json({
             status: 'success',
             data: {
                user
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: "Invalid data sent",
        });
    }
}

exports.updateMe = async (req, res, next) => {
    try {

        // 1- create a error if user post password data

        if (req.body.password || req.body.passwordConfirm){
            return next(new AppError('This route is not for password update. please use /updateMyPassword.',400));
        }

        // 2- filtered out unwanted fields name that are not allowed to be updated

        const filterBody = filterObj(req.body, 'name','email');

        // 3- update user document

        const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
            new : true,
            runValidators: true
        });

        res.status(200).json({
            status : 'success',
            data :{
                user : updatedUser
            }
        });

    }catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.stack , err
        });
    }
};

exports.deleteMe = async (req, res, next) => {
    try {

        await User.findByIdAndUpdate(req.user.id, {active : false});

        res.status(204).json({
            status : 'success',
            data : null
        });

    }catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};


exports.createUser =(req, res) => {
    res.status(500).json({
        status: 'error',
        message:'This route is does not define yet'
    });
}


exports.getUser =(req, res) => {
    res.status(500).json({
        status: 'error',
        message:'This route is does not define yet'
    });
}

exports.updateUser =(req, res) => {
    res.status(500).json({
        status: 'error',
        message:'This route is does not define yet'
    });
}

exports.deleteUser =(req, res) => {
    res.status(500).json({
        status: 'error',
        message:'This route is does not define yet'
    });
}
