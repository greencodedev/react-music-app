const db = require("../database-config");

module.exports = {
    insertToken,
    getToken,
    removeToken,
}

function insertToken(token) {
    return db("Token").insert(token)
}

function getToken(token) {
    return db("Token").where({
        token
    })
}

function removeToken(userId) {
    return db("Token").where({
        userId
    }).del();
}
