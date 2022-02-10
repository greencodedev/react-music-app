const router = require("express").Router();


//* ROUTES
const userRouter = require("./routes/userRouter");
// const purchaseRouter = require("./routes/purchaseRouter");
const tokenRouter = require("./routes/tokenRouter");
const audioRouter = require("./routes/audioRouter");
const contactRouter = require("./routes/contact");
const payPalRouter = require("./routes/payPal");
const productRouter = require("./routes/productRouter");
const videoRouter = require("./routes/videoRouter");
const pluginRouter = require("./routes/pluginRouter");
const adminRouter = require("./routes/adminRouter");


//* MIDDLEWARE
const restricted = require("./middleware/restricted");
const verifyAdmin = require("./middleware/verifyAdmin");

router.use("/user", userRouter);
router.use("/token", tokenRouter);
// router.use("/purchase", restricted, purchaseRouter);
router.use("/audio", restricted, audioRouter)
router.use("/contact", contactRouter)
router.use("/paypal", payPalRouter)
router.use("/product", restricted, productRouter)
// router.use("/videos", restricted, videoRouter)
router.use("/plugin", restricted, pluginRouter)
router.use("/admin", restricted, verifyAdmin, adminRouter)

router.use("/", (req, res) => {
  res.status(200).json({
    api: "api-router: up"
  })
});

module.exports = router;
