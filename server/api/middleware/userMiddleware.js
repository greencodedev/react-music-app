const userDb = require("../../../database/model/userModel");

module.exports = {
    checkExistingUsers,
};

function checkExistingUsers(req, res, next) {
    const email = req.body.email.toLowerCase()
    userDb.getUserByEmail(email).then(([user]) => {
        if (user) res.status(400).send({
            msg: 'The email address you have entered is already associated with another account.',
        })
        else next()
    })
}
