const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name : {
        type : 'string',
        required : [true, 'please tell us your name']
    },
    email : {
        type : 'string',
        required : [true, 'please tell us your email'],
        unique : true,
        lowercase : true,
        validate : [validator.isEmail,  'please provide a valid email']
    },
    photo : String,
    role :{
        type : 'string',
        enum : ['user', 'guide', 'lead-guide', 'admin'],
        default : 'user'
    },
    password : {
        type : 'string',
        required : [true, 'please provide us your password'],
        minlenght :8,
        select : false
    },
    passwordConfirm : {
        type : 'string',
        required : [true, 'please confirm your password'],
        validate : {
            validator : function(value) {
                return value === this.password;
            },
            message : 'enter same password'
        }
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpires : Date,
    active : {
        type : 'boolean',
        default : true,
        select : false
    },
});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now()- 1000;
    next();
});

userSchema.pre(/^find/, function(next){
    //this point to current query

    this.find({ active: true});
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp= parseInt(this.passwordChangedAt.getTime()/1000, 10);

        return JWTTimestamp < changedTimestamp;
    }

    //false means not changed
    return false;
};

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10*60*1000 ;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;