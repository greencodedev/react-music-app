const router = require("express").Router();

router.get("/", (req, res) => {
    res.status(200).json({
        "msg": "you are a admin"
    })
})

router.use("/", (req, res) => res.status(200).json({
    "route": "admin route up"
}))

module.exports = router;
