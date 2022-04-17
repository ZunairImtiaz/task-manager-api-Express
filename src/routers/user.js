const express = require('express');
const router = new express.Router();
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWellcomeEmail, sendCancelationEmail } = require('../emails/account');

async function signUp(req,res) {
    const user = new User(req.body);
    try {
        await user.save();
        // sendWellcomeEmail(user.email, user.name);   enable for use email functionality
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
}

async function logIn(req,res) {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (error) {
        res.status(400).send({ message: 'Not Authorized!' });
    }
}

async function logOut(req,res) {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();
        res.send('logOut Successfully');
    } catch (error) {
        res.status(500).send('server error');
    }
}

async function logOutAll(req,res) {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send('Successfully LogOut from all other devices');
    } catch (error) {
        res.status(500).send('server error');
    }
}

async function readProfile(req,res) {
    res.send(req.user);
}

async function updateUser(req,res) {
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid operation' });
    }
    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save();
        res.send(req.user);
    } catch (error) {
        res.status(400).send(error);
    }
}

async function deleteUser(req,res) {
    try {
        await req.user.remove();
        // sendCancelationEmail(req.user.email, req.user.name);  enable for send email funcationality
        res.send({message: 'user removed Successfully'});
    } catch (error) {
        res.status(500).send(error);
    }
}

//  uploading image and deleting --------->>>>>
const upload = multer({
    limits: { fileSize: 1000000 },
    fileFilter(req,file,cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
            cb(new Error('files must be an Image'))
        }
        cb(undefined, true);
    }
});
async function uploadImage(req,res) {
    req.user.avatar = await sharp(req.file.buffer).resize({ width: 250, height:250 }).png().toBuffer();
    await req.user.save();
    res.send({message: 'Image upload successfully'});
}

async function deletedImage(req,res) {
    req.user.avatar = undefined;
    await req.user.save();
    res.send({message: 'image removed successfully'});  
}

async function getImage(req,res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error();
        }
        res.set({'Content-Type': 'image/png'}).send(user.avatar);
    } catch (error) {
        res.status(400).send(error);
    }
}

//  routes here -------------------------->>
router.post('/signup', signUp);
router.post('/login', logIn);
router.post('logout', auth, logOut);
router.post('/logoutAll', auth, logOutAll);
router.route('/me').get(auth, readProfile).patch(auth, updateUser).delete(auth, deleteUser);
// avatar routes
router.route('/me/avatar').post(auth, upload.single('avatar'), uploadImage, (error,req,res,next) => res.status(400).send({error: error.message})).delete(auth, deletedImage);
router.get('/:id/avatar', getImage);

module.exports = router;