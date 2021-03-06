const jwt = require('jwt-then'); // A wrapper for jsonwebtoken package
const validator = require('validator');
const passwordValidator = require('password-validator');

const User = require.main.require('./user').models.user;
const config = require.main.require('./config');

// Create a schema
const passwordSchema = new passwordValidator()
    .is().min(6)
    .is().max(100)
    .has().letters()
    .has().digits()
    .has().not().spaces()
    .is().not().oneOf(['Passw0rd', 'Password123']);

/* These are sample codes where you can use as express route middlewares */
// const requireAuth = passport.authenticate('jwt', {session: false});
// const requireLogin = passport.authenticate('local', {session: false});

function createCleandUser(user) {
    // A tricky way to clone user object.
    const cleandUser = JSON.parse(JSON.stringify(user));
    // NOTE: Be very careful to mask out sensitive fields.
    delete cleandUser.password;
    delete cleandUser.__v;
    delete cleandUser.id;
    delete cleandUser._id;

    return cleandUser;
}

// TODO Show message to user if the session is timeout
// Define functions for authentication systems
function asyncSignJWT(user) {
    return jwt.sign({
        user: createCleandUser(user),
    }, config.JWT_SECRET, {
        expiresIn: 60 * 60 * 24, // expires in 24 hours
        subject: user.id,
    });
}

async function respondAuth(res, user) {
    if (user) {
        res.json({
            user: createCleandUser(user),
            token: await asyncSignJWT(user),
        });
    } else {
        setTimeout(() => {
            res.status(401).send({error: 'Incorrect username/password'});
        }, 300); // Timout 0.3 second to prevent attack
    }
}

// This function is called after passport verification of local strategey
async function login(req, res, next) {
    const {password, email} = req.body;

    try {
        const userMatched = await User.findOne({email});
        if (!userMatched) {
            respondAuth(res);
        } else {
            const samePassword = await userMatched.comparePassword(password);
            // Respond with user info or fail
            respondAuth(res, samePassword ? userMatched : false);
        }
    } catch (err) {
        next(err);
    }
}

// Use new async await to mongoose and bycrypt
async function signup(req, res, next) {
    const user = req.body;

    // Confirm password
    if (user.password !== user.confirmedPassword) {
        return res.status(422).json({error: 'Password does not match'});
    }

    // + '' to ensure the type is string
    if (!validator.isEmail(user.email + '')) {
        return res.status(422).json({error: 'Email format error'});
    }
    if (!passwordSchema.validate(user.password + '')) {
        return res.status(422).json({error: 'Password format error'});
    }

    try {
        const userMatched = await User.findOne({'email': user.email});
        if (userMatched) {
            res.status(409).json({
                error: 'Email has been used already.',
            });
        } else {
            const userCount = await User.count();
            // Assign each fields by hand to prevent injection attack
            const newUser = new User({
                email: user.email,
                password: user.password,
                name: user.name,
                photo: user.photo,
                permissions: (userCount === 0) ? ['basic', 'advanced'] : ['basic'],
            });
            await newUser.save();
            respondAuth(res, newUser);
        }
    } catch (err) {
        next(err);
    }
}

async function reAuthorize(req, res, next) {
    const {token} = req.body;
    if (typeof token !== 'string') res.status(401).send({error: 'Unauthorized'});
    try {
        const user = await jwt.verify(token, config.JWT_SECRET);
        // Fetch user info from database for the latest result.
        const userMatched = await User.findById(user.sub);

        if (!userMatched) {
            res.status(401).send({error: 'Unauthorized'});
        } else {
            respondAuth(res, userMatched);
        }
    } catch (err) {
        res.status(401); // Reset status code to 401 for all errors
        next(err);
    }
}

module.exports = (app) => {
    app.post('/api/login', login);
    app.post('/api/signup', signup);
    app.post('/api/reauth', reAuthorize);
};
