const db = require("../database-config");

module.exports = {
    insertUser,
    getUserById,
    getUserByEmail,
    getUserByPayPalSubscriptionId,
    getUserByPayPalTransactionId,
    updateUser,
    removeUser
}

function insertUser(user) {
    return db("User").insert(user)
}

function getUserById(id) {
    return db("User").where({
        id
    })
}

function getUserByEmail(email) {
    return db("User").where({
        email
    })
}

function getUserByPayPalSubscriptionId(payPal_subscription_id) {
    return db("User").where({
        payPal_subscription_id
    })
}

function getUserByPayPalTransactionId(payPal_transaction_id) {
    return db("User").where({
        payPal_transaction_id
    })
}

function updateUser(user) {
    return db("User").update(user).where("id", user.id)
}

function removeUser(id) {
    return db("User").where({
        id
    }).del();
}
