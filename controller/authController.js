const { promisify } = require('util');
const crypto = require('crypto')    
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError.js');
const sendEmail = require('./../utils/email.js');

const signToken = (id)=>{
    return  jwt.sign({ id : id}, 'my-ultra-secure-and-long-secret ' , {
        expiresIn : 9990000000000
     });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
            expires : new Date( Date.now() + 90 *24*60*60*1000),
            httpOnly : true
        }
        res.cookie('jwt', token, cookieOptions);

        res.status(statusCode).json({
            status : 'success',
            token,
            data :{
               user
            }
        });
}

exports.signUp = async (req, res, next) => {
    try {

        const newUser = await User.create(req.body);

        createSendToken(newUser, 201, res);
        

    }catch(err) {
        res.status(404).json({
            status : 'fail',
            message : 'Invalid username or password'
        });
    }
};

exports.login = async(req, res, next) =>{
    try{
        const email = req.body.email;
        const password = req.body.password;

    // Check whether the email and password is exists

        if(!email || !password){
        return next(new AppError('check your email and password'),400);
        }

        const user = await User.findOne({email : email}).select('+password');
       
        if(!user || !(await user.correctPassword(password, user.password)
        )){
            return next(new AppError('Invalid email or password',401));
        }
        
       createSendToken(user, 200,res); 

    }catch(error){
        res.status(500).json({
            status : 'error',
            message : 'something went wrong'
        });
    }
};

exports.protect = async (req, res, next) => {
    try {
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1];
        }
      
        if(!token){
            return next(new AppError('you are not logged in ! please log in to get access',401));
        }

        // verification token

        const decoded = await promisify(jwt.verify)(token, 'my-ultra-secure-and-long-secret ' );

        // check if user is still existing

        const freshUser = await User.findById(decoded.id);
        if(!freshUser){
            return next(new AppError('The user belongs to the tokeen is not exists'));
        }

        // check if user changed password after token issued
        
        if(freshUser.changePasswordAfter(decoded.iat)){
            return next(new AppError('User recently changed password! please login again.',401));
        };
        
        // grant access to protected route
        req.user = freshUser;
        next();
    }catch(error) {
        res.status(500).json({
            status : 'fail',
            message : error.message
        });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles[admin, lead-guide]     , role=user

        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to this action.',403)
            );
        }
        next();
    };
};

exports.forgotPassword = async (req, res, next) => {
    try{
        // 1 - get user based on posted email
        const user = await User.findOne({email : req.body.email});
        if(!user){
            return next(new AppError('There is no user with this email address.'),404);
        }

        // 2 - generate the random reset token

        const resetToken = user.createPasswordResetToken();
        await user.save({validateBeforeSave : false});

        // 3 - send token to user email

        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

        const message = `forgot your password? submit a PATCH request to reset your password with new password to ${resetURL}.\n If you didnt forgot your password then please ignore this email`;

        try{
            await sendEmail({
                email: user.email,
                subject : 'Your password reset token (valid for 10 minutes)',
                message
            });
    
            res.status(200).json({
                status : 'success',
                message : 'Token sent to email!'
            });

        } catch(err){
            user.PasswordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave : false });
            return next(new AppError(err,500));
        }
        

    }catch(error) {
        res.status(500).json({
            status : 'fail',
            message : error.message
        });
    }
};

exports.resetPassword = async(req, res, next) => {
    try{
        // 1 - get user based on token

        const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({ passwordResetToken:hashToken, passwordResetExpires :{$gt: Date.now()}});

        // 2 - if token not expired then set the new password

        if(!user) {
            return next(new AppError('email is invalid or has expiredToken',400));
        }
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.PasswordResetToken = undefined;
        user.PasswordResetExpires = undefined;
        await user.save();

        // 3 - update changedPasswordAt property for user
        // use middleware function

        // 4 - login the user in , send jwt

       createSendToken(user, 200, res);

    }catch(error) {
        res.status(500).json({
            status : 'fail',
            message : error.message
        });
    }
};

exports.updatePassword = async (req, res, next) => {
    try {
        // 1-  get user from the database
        const user = await User.findById(req.user._id).select('+password');
        
        // 2- check if posted password is correct

        if(! await user.correctPassword(req.body.passwordCurrent, user.password)){
            return next(new AppError('your current password is incorrect.',401));
        }

        // 3- if so, update password

        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();


        // 4- login the user in , send jwt

        createSendToken(user, 200, res);

    }catch(error) {
        res.status(500).json({
            status : 'fail',
            message : error.message
        });
    }
};