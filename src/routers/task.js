const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

async function postTask(req,res) {
    const task = new Task({ ...req.body, owner:req.user._id});
    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
}

async function readTasks(req,res) {
    const match = {};
    const sort = {};
    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc'? -1: 1;
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match, 
            options:  {limit: parseInt(req.query.limit), skip: parseInt(req.query.skip), sort}
        });
        return res.send(req.user.tasks);
    } catch (error) {
        res.status(404).send({error: 'Not found'});
    }
}

async function readOneTask(req,res) {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        if (!task) {
            return res.status(404).send({error: 'task not found'});
        }
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
}

async function updateTask(req,res) {
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => ['description','completed'].includes(update));
    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid Operation'})
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        if (!task) {
            return res.status(404).send({error: 'task not found'});
        }
        updates.forEach(update => task[update] = req.body[update]);
        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }
}

async function deleteTask(req,res) {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id });
        if (!task) {
            return res.status(404).send({error: 'task not found'});
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error);
    }
}

router.route('/').post(auth, postTask).get(auth, readTasks);
router.route('/:id').get(auth, readOneTask).patch(auth, updateTask).delete(auth, deleteTask);

module.exports = router;