const db = require("../database-config");

module.exports = {
    getOffers,
    insertOffer,
    getOfferById,
    getOfferByName,
    updateOffer,
    removeOffer
}


function getOffers() {
    return db("Offer")
}

function insertOffer(data) {
    return db("Offer").insert(data)
}

function getOfferById(id) {
    return db("Offer").where({
        id
    })
}

function getOfferByName(name) {
    return db("Offer").where({
        name
    })
}

function updateOffer(tier, data) {
    return db("Offer").update(data)
        .where({
            tier
        })
}

function removeOffer(id) {
    return db("Offer").where({
        id
    }).del();
}
