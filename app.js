// console.log("hello world");
// database password = jBY2uMn4P1EGmRql
// database url = mongodb+srv://piyushpawar:jBY2uMn4P1EGmRql@cluster0.pwsrckl.mongodb.net/
const express= require('express');
const fs=require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controller/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const { error } = require('console');
const app = express();

// server side rendering

app.set('view engine', 'pug');
app.set('views', path.join(__dirname,'views'))

//global middleware

// static files

app.use(express.static(path.join(__dirname,'starter/public')));

// - set security HTTP headers
app.use(helmet());

// - limit requests from same API
const limiter = rateLimit({
    max : 100,
    windowMs : 60*60*1000,
    message : 'Too many requests from this IP, please try again in an hour.'
});

app.use('/api', limiter);

// - development logging
app.use(morgan('dev'));

// - Body parser, reading data from body into req.body
app.use(express.json({limit : '10kb'})); 

// data sanitization against NoSQL query injection
// this filtered the body by removing special operators 
app.use(mongoSanitize());

// data sanitization against xss
// prevent against any html code with js code that could attach to the body
app.use(xss());

// prevent parameter pollution
app.use(hpp({
    whitelist : [
        'duration','ratingQuantity','ratingAverage','difficulty','price','maxGroupSize'
    ]
}));

// - test middleware
app.use((req, res, next) => {
    console.log('hello from middleware');
    next();
});
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

//ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*',(req, res, next) => {
    // res.status(404).json({
    //     status : 'fail',
    //     message : `Can't find ${req.originalUrl} on the server!`
    //     })

    // const err = new Error(`Can't find ${req.originalUrl} on the server!`);
    // err.statusCode = 404;
    // err.status = 'fail';

    next(new AppError(`Can't find ${req.originalUrl} on the server!`,404));
});

app.use(globalErrorHandler);

module.exports = app;