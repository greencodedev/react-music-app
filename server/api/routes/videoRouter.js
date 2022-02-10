const router = require("express").Router();
const {
    getVideos
} = require("../../../database/model/videoModel");

router.get("/", (req, res) => {
    getVideos().then(resp => res.status(200).json(resp)).catch(err => console.error(err))
})

module.exports = router;
