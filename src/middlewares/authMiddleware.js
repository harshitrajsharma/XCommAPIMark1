import jwt from 'jsonwebtoken';

const verifyJWT = (req, res, next) => {
    let authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                error: "Access token is Invalid"
            });
        }

        req.user = user.id;
        next();
    });
};

export default verifyJWT;