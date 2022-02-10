const router = require("express").Router();
const {
    body,
    validationResult
} = require('express-validator');

const tokenEmailer = require("../utils/tokenEmailer.js")
const {
    getToken,
    removeToken,
} = require("../../../database/model/tokenModel");
const {
    getUserById,
    updateUser,
    getUserByEmail
} = require("../../../database/model/userModel");

router.get("/confirmation/:token", (req, res) => {
    const {
        token
    } = req.params;

    getToken(token).then(([token]) => {
        //* token has expired or not found
        if (!token || (Date.now() - token.expiresAt >= 0)) {
            //* remove expired token
            if (token) removeToken(token.userId).then(null)
            return res.status(400).send({
                type: 'not-verified',
                msg: 'We were unable to find a valid token. Your token may have expired.'
            })
        }
        //* verify user
        getUserById(token.userId).then(([user]) => {
            if (!user) return res.status(400).send({
                msg: 'We were unable to find a user for this token.'
            });
            if (user.isVerified) return res.status(400).send({
                type: 'already-verified',
                msg: 'This user has already been verified.'
            });

            user.isVerified = true
            updateUser(user).then(() => res.status(200).send("The account has been verified. Please log in.")).catch(err => res.status(500).send({
                msg: err.message
            }))
            //? why is the .then required to remove the token?
            removeToken(user.id).then(null)
        })
    })
})

router.post("/resend", [body('email').isEmail().normalizeEmail()], (req, res) => {
    //* check for active tokens first and remove
    const {
        email
    } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).send(errors.array());

    getUserByEmail(email).then(([user]) => {
        if (!user) return res.status(400).send({
            msg: "We were unable to find a account associated with this email."
        })
        if (user.isVerified) return res.status(400).send({
            msg: 'This account has already been verified. Please log in.'
        });
        //* remove any existing tokens
        removeToken(user.id).then(null)

        return res.send(tokenEmailer(user, req.headers.host))
    })
})


router.use("/", (req, res) => {
    res.status(200).json({
        Route: "Token Route"
    });
});


module.exports = router
