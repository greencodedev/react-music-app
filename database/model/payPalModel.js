const db = require("../database-config");

module.exports = {
    insertTransaction,
    getTransaction,
    updateTransaction
}

function insertTransaction(transaction_id, payment_status) {
    return db("PayPal").insert({
        transaction_id,
        payment_status,
        created: Date.now()
    })
}

function getTransaction(transaction_id) {
    return db("PayPal").where({
        transaction_id
    })
}

function updateTransaction(transaction_id, payment_status) {
    return db("PayPal").update({
        payment_status,
        updated: Date.now()
    }).where({
        transaction_id
    })
}
