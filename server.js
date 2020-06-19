const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config({
    path: './config/config.env'
});

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({
    extended: false
}));

app.get('/', (req, res) => {
    res.send('Hello')
});

// Define Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/users', require('./routes/api/users'));


const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));