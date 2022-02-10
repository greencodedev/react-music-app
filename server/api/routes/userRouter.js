const router = require("express").Router();
const {
    insertUser,
    getUserByEmail,
    updateUser,
    getUserById,
} = require("../../../database/model/userModel");
const {
    getSoundsBy
} = require("../../../database/model/soundModel");
const {
    getSubscriberById,
    removeSubscription
} = require("../../../database/model/subscriptionModel");
const {
    getDownloadsByUserId
} = require("../../../database/model/soundDownloadModel");
const {
    getPluginById
} = require("../../../database/model/pluginModel");
const {
    hashSync,
    compareSync
} = require("bcryptjs");
const jwt = require("jsonwebtoken")
const tokenEmailer = require("../utils/tokenEmailer");
const {
    v1: uuidv1
} = require('uuid');
const {
    body,
    validationResult
} = require('express-validator');

const {
    checkExistingUsers
} = require("../middleware/userMiddleware");
const restricted = require("../middleware/restricted");

//todo *refactor* split this into a auth, user, and plugin router
router.post("/register",
    //* validate email and password
    [body('email').isEmail().normalizeEmail(),
        body('password').isLength({
            min: 6
        })
    ],
    checkExistingUsers, (req, res) => {
        // console.log("body", req.body)
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send(errors.array());
        const {
            email,
            password,
            first_name,
            last_name
        } = req.body;
        const user = {
            id: uuidv1(),
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: hashSync(password, 13),
            created: Date.now()
        }
        insertUser(user)
            .then(() => res.status(200).json(tokenEmailer(user, req.headers.host)))
            .catch((err) =>
                res.status(500).json(err)
            );
    });

router.post("/login",
    [body('email').isEmail().normalizeEmail()], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).send(errors.array());
        const {
            email,
            password
        } = req.body;
        const [user] = await getUserByEmail(email);

        if (!user) return res.status(403).json({
            msg: `The email address ${req.body.email} is not associated with any account. Please double-check your email address and try again.`
        });
        //* Check password
        if (!compareSync(password, user.password)) return res.status(403).json({
            msg: "Incorrect Password."
        });
        //* Check user has verified email
        if (!user.isVerified) return res.status(401).send({
            type: 'not-verified',
            msg: 'Your account has not been verified.'
        });
        //* check active subscription
        getSubscriberById(user.id).then(([subscriber]) => {
                if (subscriber && subscriber.subscribe_end - Date.now() > 0)
                    user.active_subscription = true
                else {
                    user.active_subscription = false
                    removeSubscription(user.id).then(null)
                }
                user.last_login = Date.now()
                updateUser(user).then(null)

                //* Login successful, write token, and send back token
                res.status(200).json({
                    token: generateToken(user)
                });
            })
            .catch((err) => res.status(500).json({
                msg: "unable to retrieve user",
                error: err.message,
            }))
    });

/*
//* EMAIL FOR LINDON PARKER
Currently in the database I have 5 mock vst’s w/ id’s ranging from 1-5.

endpoint: "localhost:5001/api/user/login/:vst_id" (replace :vst_id with the vst_id)

POST Request
Body: {
    email: "",
    password: "password"
}

I have created you 3 test users to test full functionality as listed below:
user1@testing.com: no access to any vst;
user2@testing.com: access to vst’s 1-3;
user3@testing.com: access to all vst’s;
The password for all 3 users is: ‘password’


Here are all the responses that can be returned from the API:
Invalid email format (user1@test) -> status(400) w/ an array of errors (this one is unique);
Invalid vst_id in endpoint -> status 404;
Email is not associated with a user -> status(405) w/ json {msg:””};
Incorrect Password -> status(403) w/ json {msg:””};
No access to this vst -> status(402) w/ json {msg:””};
Valid credentials and access to VST -> status(200) w/ json {token:””};
*/


router.post("/login/:vst_id", [body('email').isEmail().normalizeEmail()], async (req, res) => {
    const vst_id = req.params.vst_id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).send(errors.array());
    const {
        email,
        password
    } = req.body;
    const [vst] = await getPluginById(vst_id)
    if (!vst) return res.status(404).end()

    const [user] = await getUserByEmail(email)
        .catch((err) => res.status(500).json({
            msg: "unable to retrieve user",
            error: err.message,
        }))

    if (!user) return res.status(405).json({
        msg: `The email address ${req.body.email} is not associated with any account. Please double-check your email address and try again.`
    });
    //* Check password
    if (!compareSync(password, user.password)) return res.status(403).json({
        msg: "Incorrect Password."
    });
    //* Check user has verified email
    if (!user.isVerified) return res.status(401).send({
        type: 'not-verified',
        msg: 'Your account has not been verified.'
    });
    //* check active subscription
    const [subscriber] = await getSubscriberById(user.id);

    let subscriber_tier = 0;
    if (subscriber && subscriber.subscribe_end - Date.now() > 0) {
        user.active_subscription = true
        subscriber_tier = subscriber.plan_id;
    } else {
        user.active_subscription = false
        removeSubscription(user.id).then(null)
    }
    user.last_vst_login = Date.now();
    updateUser(user).then(null)
    if (subscriber_tier < vst.access_tier) return res.status(402).json({
        msg: `Your subscription to tier ${subscriber_tier} doesn't have access to this plug-in.`
    }).end()

    //* Login successful, write token, and send back token
    else res.status(200).json({
        token: generateToken(user),
        msg: "Lindon, we can do something else here if you are unable to decode the JSON Web Token. It will always be a json response."
    })
})



router.post("/forgotPassword", [body('email').isEmail().normalizeEmail()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).send(errors.array());

    const {
        email,
    } = req.body;

    const [user] = await getUserByEmail(email);
    if (!user) return res.status(403).json({
        msg: `The email address ${req.body.email} is not associated with any account. Please double-check your email address and try again.`
    });
    // if (!user.isVerified) return res.status(401).send({
    //     type: 'not-verified',
    //     msg: 'Your account has not been verified.'
    // });
    //* send token email & save variable
    const token = tokenEmailer(user, req.headers.host, "password");

    user.password_reset_token = token.token
    user.password_reset_expires = Date.now() + 21600000 //6hrs
    updateUser(user).then(() => res.status(200).send({
        msg: `A Email as been sent to ${req.body.email} with a link to reset your password. This link will expire in 6 hours.`
    }))
})

router.post("/resetPassword", [body('email').isEmail().normalizeEmail()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).send(errors.array());
    const {
        email,
        password,
        token
    } = req.body;

    const [user] = await getUserByEmail(email);
    if (!user) return res.status(403).json({
        msg: `The email address ${req.body.email} is not associated with any account. Please double-check your email address and try again.`
    });
    //* Token expired
    // console.log(user.password_reset_token, token);
    if (Date.now() - user.password_reset_expires >= 0) {
        user.password_reset_token = null
        user.password_reset_expires = null
        return updateUser(user).then(() => res.status(400).json({
            type: 'token-expired',
            msg: 'We were unable to find a valid token. Your link has expired.'
        }))
    }
    if (user.password_reset_token === token) {
        user.password_reset_token = null
        user.password_reset_expires = null
        user.password = hashSync(password, 13)

        return updateUser(user).then(() => res.status(200).json({
            type: 'password-reset',
            msg: `Password has been successfully been changed.`
        }))
    }
    return res.status(400).json({
        type: 'wrong-token',
        msg: 'We were unable to find a valid token. Please try the reset-password link again in your email.'
    })
})

// router.delete("/:id", (req, res) => {
//? use token w/ restricted route
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(400).send(errors.array());
//     const {
//         id
//     } = req.params;
//     const {
//         password
//     } = req.body;

//     getUserById(id).then(([user]) => {
//         if (!user) return res.status(403).json({
//             msg: `The user id: ${id} is not associated with any account.`
//         });
//         //* Check password
//         if (!compareSync(password, user.password)) return res.status(403).json({
//             msg: "Invalid password"
//         });
//         if (user.balance > 0) return res.status(403).json({
//             msg: `This account still has a balance of ${user.balance} credits. Please spend remaining credits before deleting account.`
//         });
//         removeUser(id).then(() => res.status(200).send({
//             msg: "Successfully removed user"
//         }))
//     })
// })

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const [user] = await getUserById(id);
    if (user) {
        let userData = {};
        userData.id = user.id;
        userData.first_name = user.first_name
        userData.last_name = user.last_name
        userData.active_subscription = user.active_subscription;
        userData.balance = user.balance;
        userData.payPal_subscription_id = user.payPal_subscription_id;
        userData.role = user.role;
        if (user.active_subscription)
            getSubscriberById(user.id).then(([sub]) => {
                userData.currentPlanId = sub.plan_id;
                res.status(200).json(userData)
            })
        else res.status(200).json(userData)
    }
})

router.get("/:id/downloads", restricted, async (req, res) => {
    // todo *refactor* get all sounds full data to send back down
    const id = req.params.id;
    const downloads = await getDownloadsByUserId(id);
    const sounds = []
    if (!downloads.length) res.status(200).json([])
    else downloads.forEach(async ({
        name
    }, i) => {
        const [sound] = await getSoundsBy({
            name
        })
        sounds.push(sound)
        if (i === downloads.length - 1) res.status(200).json(sounds)
    })

})

router.use("/", (req, res) => {
    res.status(200).json({
        Route: "User Route"
    });
});

module.exports = router;


//todo anti-spoof?, use random number to validate? VST LOGIN
function generateToken(user) {
    // console.log(user)
    const {
        id
    } = user;
    const {
        JWT_SECRET
    } = process.env
    const payload = {
        subject: id,
    };
    const options = {
        expiresIn: "72hr",
    };
    return jwt.sign(payload, JWT_SECRET, options);
}
