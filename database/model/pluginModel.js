const db = require("../database-config");

module.exports = {
    getPluginById,
    getPlugins
}


function getPluginById(id) {
    return db("Plugin").where({
        id
    })
}

function getPlugins() {
    return db("Plugin")
}
