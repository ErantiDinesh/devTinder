const express = require('express');
const connectDB = require('./config/database')
const app = express();
const { userAuth } = require('./middlewares/auth');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')
const requestRoutes = require('./routes/request')

app.use(express.json());
app.use(cookieParser());


app.use('/', authRoutes);
app.use('/', userAuth, profileRoutes);
app.use('/', userAuth, requestRoutes);
 

connectDB()
.then(() => {
    console.log("MongoDB connected successfully");
    app.listen(7777, () => {
    console.log("Server running at port 7777");
}); })
.catch((err) => {
    console.error("MongoDB connection failed:", err);
});
