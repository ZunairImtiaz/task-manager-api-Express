const express = require('express');
const connectDB = require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

connectDB();
const app = express();

// to take input in request body
app.use(express.json());

app.use('/users',userRouter);
app.use('/tasks', taskRouter);

const port = process.env.PORT;
app.listen(port, () => console.log(`server is connected on port "${port}"`));