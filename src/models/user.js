const mongoose = require('mongoose');
const validator = require('validator');
const { hash, genSalt, compare } = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const Task = require('./task');

const userSchema = mongoose.Schema({
    name: {type: String, required: true, trim: true},
    email: {type: String, unique: true, required: true, lowercase: true, trim: true, validate(value) {
        if (!validator.isEmail(value)) {
            throw new Error('Invalid Email you entered')
        }
    }},
    password: {type: String, required: true, trim: true, minlength: 6, validate(value) {
        if (value.toLowerCase().includes('password')) {
            throw new Error('Invalid password you entered')
        }
    }},
    age: {type: Number, default: null, validate(value) {
        if (value < 0) {
            throw new Error('password does not contain "password"')
        }
    }},
    avatar: { type: Buffer },
    tokens: [{ token: { type: String, required: true}}]
}, { timestamps: true });

userSchema.virtual('tasks', { ref: 'Task' , localField: '_id', foreignField: 'owner' });

// Hide data from profile
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}

//  for jwt token 
userSchema.methods.generateAuthToken = async function() {
    const token = sign({id: this._id}, process.env.JWT_SECRET, {expiresIn: '7 days'});
    this.tokens = this.tokens.concat({ token })
    await this.save();
    return token;
}

// for user login
userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('login failed');
    }
    const isValid = await compare(password, user.password);
    if (user && !isValid) {
        throw new Error('login failed');
    }
    return user;
}

// hash password
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await hash(this.password, await genSalt());
    }
    next();
})

// delete tasks of user who remove himself
userSchema.pre('remove', async function (next) {
    await Task.deleteMany({ owner: this._id });
    next();
})

const User = mongoose.model('User', userSchema);
module.exports = User;