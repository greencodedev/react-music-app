const {
    EBS
} = require("aws-sdk");
const db = require("../database-config");

module.exports = {
    insertSound,
    getSoundCount,
    getSounds,
    getSoundsBy,
    searchSounds,
    getColumn,
    updateSound,
    removeSound,
    getSoundById
}

function insertSound(sound) {
    return db("Sound").insert(sound)
}

function getSoundCount() {
    return db("Sound").count()
}

function getSounds(limit, offset) {
    return db("Sound").limit(limit).offset(offset)
}

function getSoundsBy(column, value) {
    return db("Sound").where(column, "like", `%${value}%`);
}

function getSoundById(id) {
    return db("Sound").where({
        id
    })

}

function searchSounds(value) {
    return db("Sound")
        .where("name", "like", `%${value}%`)
        .orWhere("pack", "like", `%${value}%`)
        .orWhere("type", "like", `%${value}%`)
        .orWhere("genre", "like", `%${value}%`)
        .orWhere("tempo", "like", `%${value}%`)
        .orWhere("duration", "like", `%${value}%`)
        .orWhere("key", "like", `%${value}%`)
        .orWhere("instrument_type", "like", `%${value}%`)
        .orWhere("tags", "like", `%${value}%`)
}

function getColumn(column) {
    return db("Sound").select(column)
}

function updateSound(sound) {
    return db("Sound").update(sound).where("id", sound.id)
}

function removeSound(id) {
    return db("Sound").where({
        id
    }).del();
}
