const router = require("express").Router();
const nodemailer = require('nodemailer');

const {
    EMAIL_HOST,
    EMAIL_USERNAME,
    EMAIL_PASSWORD,
} = process.env;

router.post("/", (req, res) => {
    const {
        name,
        email,
        subject,
        message
    } = req.body;

    // console.log("contact")
    const emailTemplate = {
        from: "noreply@sample.house",
        to: "support@sample.house",
        // to: "braden@bluesmokemedia.net", //!testing
        subject: `Contact-${subject}`,
        text: `From ${name},\n${email} \n\n${message}`,
        // replyTo: email // didn't work
        // html: "<h1></h1>"
    };

    //* email transporter and mail options
    const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        pool: true,
        port: 465,
        secure: true, // use TLS
        auth: {
            type: "login",
            user: EMAIL_USERNAME,
            pass: EMAIL_PASSWORD
        }
    });
    //* Send verification email
    transporter.sendMail(emailTemplate, (err, info) => {
        if (err) console.log(err)
        if (err) return res.status(500).send({
            msg: err.message,
        });
    });
    res.status(200).json({
        msg: "Successfully submitted. Please expect a reply within 24-48 hours."
    })
})

module.exports = router
