const { verify } = require('jsonwebtoken');
const User = require('../models/user');

async function auth(req,res,next) {
    try {
        const token = req.header('Authorization').replace('Bearer ','');
        const decoded = verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({id: decoded._id, 'tokens.token': token})
        if (!user) {
            throw new Error();
        }
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ message: 'Not Authorized!' });
    }
}

module.exports = auth;