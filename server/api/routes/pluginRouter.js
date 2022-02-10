const router = require("express").Router();
const {
    getPlugins
} = require("../../../database/model/pluginModel");

router.get("/", async (req, res) => {
    const plugins = await getPlugins();
    res.status(200).json(plugins);
})

module.exports = router;
