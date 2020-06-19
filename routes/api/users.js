const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const {
    check,
    validationResult
} = require('express-validator');

// User model
const User = require('../../models/User');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({
        min: 6
    })
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const {
        name,
        email,
        password
    } = req.body;

    try {
        // See if user exists
        let user = await User.findOne({
            email: email
        });

        if (user) {
            return res.status(400).json({
                errors: [{
                    msg: 'User already exists'
                }]
            });
        }

        // Create new instance of User
        user = new User({
            name,
            email,
            password
        });

        // Encrypt password
        // in order to do that we first need to create a salt that is used in the encryption
        const salt = await bcrypt.genSalt(10);

        // do the encryption
        user.password = await bcrypt.hash(password, salt);

        // save the user
        await user.save();

        // Get a Json web token
        // first we have to create a payload to sign
        // it needs a payload and a secret which we will save in config.json
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 3600
        }, (error, token) => {
            if (error) throw error;
            res.json({
                token
            });
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }

})

module.exports = router;