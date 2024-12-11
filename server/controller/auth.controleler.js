const User = require('../models/user.model');

const {
    signUpValidator,
    signInValidator,
} = require('../lib/validators/auth.validator');
const AuthService = require('../services/auth.services');

async function signUp(req, res) {
    const validatedReq = await signUpValidator.safeParseAsync(req.body);

    if (validatedReq.error)
        return res.status(400).json({ error: validatedReq.error });

    const { firstName, lastName, email, password } = validatedReq.data;

    try {
        const token = await AuthService.signUpService({
            firstName,
            lastName,
            email,
            password,
        });

        return res.status(201).json({ status: 'success', data: { token } });
    } catch (err) {
        console.log(`Error`, err);
        return res
            .status(500)
            .json({ status: 'error', error: 'Internal Server Error' });
    }
}

async function signIn(req, res) {
    const validatedReq = await signInValidator.safeParseAsync(req.body);

    if (validatedReq.error)
        return res.status(400).json({ error: validatedReq.error });

    const { email, password } = validatedReq.data;

    try {
        const token = await AuthService.signInService({ email, password });

        return res.status(200).json({ status: 'success', data: { token } });
    } catch (err) {
        console.log(`Error`, err);
        return res
            .status(500)
            .json({ status: 'error', error: 'Internal Server Error' });
    }
}

async function CurrentUser(req, res) {
    if (!req.user) return res.json({ isLoggedIn: false });

    const user = await User.findById(req.user._id).select({
        _id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
    });

    return res.json({ isLoggedIn: true, data: { user } });
}

module.exports = {
    signUp,
    signIn,
    CurrentUser,
};
