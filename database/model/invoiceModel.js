const db = require("../database-config");

module.exports = {
    insertInvoice,
}

function insertInvoice(data) {
    return db("Invoice").insert(data)
}
