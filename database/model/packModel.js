const db = require("../database-config");

module.exports = {
    insertPack,
    getPacks,
    getPackBy,
    updatePack,
    removePack
}

function insertPack(pack) {
    return db("Pack").insert(pack)
}

function getPacks() {
    return db("Pack")
}

function getPackBy(column, value) {
    return db("Pack").where(column, value)
}

function updatePack(pack) {
    return db("Pack").update(pack).where("id", pack.id)
}

function removePack(id) {
    return db("Pack").where({
        id
    }).del();
}
