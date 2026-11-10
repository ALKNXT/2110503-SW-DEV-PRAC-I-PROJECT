const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: 100
    },
    telephone: {
        type: String,
        required: [true, 'Please add a telephone number'],
        trim: true,
        maxlength: 25,
        match: [/^[+]?([\d\s().-]){7,25}$/, 'Please add a valid telephone number']
    },
    email:{
        type : String,
        required: [true, 'Please add an email'],
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please add a valid email']
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password:{
        type: String,
        required: [true, 'Please add a password'],
        minlength: 8,
        select: false
    },
    tokenVersion: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (_document, returnedObject) => {
            delete returnedObject.password;
            delete returnedObject.tokenVersion;
            delete returnedObject.__v;
            return returnedObject;
        }
    }
});

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getSignedJwtToken=function(){
    return jwt.sign(
        { id: this._id, tokenVersion: this.tokenVersion ?? 0 },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
}

UserSchema.methods.matchPassword= async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password);
}

module.exports = mongoose.model('User',UserSchema);
