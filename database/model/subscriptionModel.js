const db = require("../database-config");

module.exports = {
    insertSubscription,
    updateSubscription,
    getSubscriberById,
    removeSubscription
}

function insertSubscription(data) {
    return db("Subscription").insert(data)
}

function getSubscriberById(user_id) {
    return db("Subscription").where({
        user_id
    })
}

function updateSubscription(user_id, data) {
    return db("Subscription").update(data).where({
        user_id
    })
}

function removeSubscription(user_id) {
    return db("Subscription").where({
        user_id
    }).del()
}
