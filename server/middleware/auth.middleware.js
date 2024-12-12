const AuthService = require('../services/auth.services');

function authenticationMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer')) {
        console.log('No token found');
        return next();
    }

    const token = header.split(' ')[1];
    const userPayload = AuthService.decodeUserToken(token);

    if (userPayload) req.user = userPayload;

    next();
}

function checkifLoggedIn(req, res, next) {
    if (!req.user)
        return res
            .status(401) //unauthorize
            .json({ error: 'You need to be loggedin to access this resource' });

    next();
}

function restrictToRole(role) {
    const roleAccessLevelMapping = {
        admin: 0,
        user: 9,
    };

    return function (req, res, next) {
        const user = req.user;

        if (!user)
            return res.status(403).json({
                error: 'You need to be loggedin to access this resource',
            });

        const userAccessLevel = roleAccessLevelMapping[user.role];
        const requiredAccessLevel = roleAccessLevelMapping[role];

        if (userAccessLevel > requiredAccessLevel)
            return res.status(403).json({ error: 'Access Denied' });

        next();
    };
}

module.exports = {
    authenticationMiddleware,
    restrictToRole,
    checkifLoggedIn,
};
