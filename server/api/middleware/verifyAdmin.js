module.exports = (req, res, next) => {
    console.log(req.user)
    if (req.user.role === "admin") next()
    else res.status(403).json({
        "msg": "Admin access only"
    })
}
