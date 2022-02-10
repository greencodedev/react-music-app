const router = require("express").Router();
const ipn = require("paypal-ipn")
// const webhook = require("paypal-node-sdk")
// const paypal = require('paypal-rest-sdk')
const axios = require("axios")
const payPalDb = require("../../../database/model/payPalModel");
const {
    getUserById,
    updateUser,
    getUserByPayPalSubscriptionId,
    getUserByPayPalTransactionId
} = require("../../../database/model/userModel");
const offerDb = require("../../../database/model/offerModel");
const planDb = require("../../../database/model/planModel");
const {
    insertSubscription,
    getSubscriberById,
    updateSubscription,
    removeSubscription
} = require("../../../database/model/subscriptionModel");
const createInvoice = require("../utils/createInvoice");
const NODE_ENV = process.env.NODE_ENV;
const productionEnv = NODE_ENV === "production";
const day = 86400000;
// 1. PayPal HTTPS POSTs an IPN message to your listener that notifies it of an event.
router.post("/ipn", (req, res) => {
    console.log("👍🏼")
    const {
        txn_id,
        payment_status,
        receiver_email,
        product_name,
        mc_currency,
        mc_gross,
        recurring_payment_id,
        txn_type,
        item_name1 //* because sending as a 'cart'
    } = req.body
    // console.log(req.body)
    // 2. Your listener returns an empty HTTP 200 response to PayPal.
    res.status(200).send("OK").end()
    // res.end()
    // 3. Your listener HTTPS POSTs the complete, unaltered message back to PayPal;
    ipn.verify(req.body, {
        'allow_sandbox': true
    }, async function callback(err, msg) {
        // 4. PayPal sends a single word back - either VERIFIED (if the message matches the original) or INVALID (if the message does not match the original)
        if (err) {
            console.error(err);
        } else {
            // console.log(msg) //! Verified
            // 5. Verify that you are the intended recipient of the IPN message. To do this, check the email address in the message. //todo change this email to paypal live email (Craig's)

            if (productionEnv && receiver_email !== 'craigfechtermusic@gmail.com') return console.log("LIVE receiver_email is not correct");
            else if (!productionEnv && receiver_email !== 'sb-f2tra4923122@business.example.com') return console.log("TESTING receiver_email is not correct"); //!testing
            // console.log("5-verify receive email")
            // 6. Verify that the IPN is not a duplicate. To do this, save the transaction ID and last payment status in each IPN message in a database and verify that the current IPN's values for these fields are not already in this database.
            let existingSuccessIPN = null;
            if (txn_id) await payPalDb.getTransaction(txn_id).then(([resp]) => {
                if (resp) {
                    if (resp.payment_status !== payment_status) {
                        return payPalDb.updateTransaction(txn_id, payment_status).then(() => existingSuccessIPN = false)
                    } else
                        return existingSuccessIPN = true;

                } else
                    return payPalDb.insertTransaction(txn_id, payment_status).then(() => existingSuccessIPN = false)
            })
            //! CHECK IPN TYPE
            //! SUBSCRIPTION PAYMENT (monthly)
            if (txn_type === "recurring_payment") {
                // console.log("txn_type is new subscription")
                // 7. Check that the payment_status is Completed.
                // 8.(step 6) If the payment_status is Completed, check the txn_id against the previous PayPal transaction that you processed to ensure the IPN message is not a duplicate.
                if (payment_status === 'Completed' && existingSuccessIPN === false) {
                    // console.log({
                    //     existingSuccessIPN
                    // }, {
                    //     payment_status
                    // })
                    // 9.(step 5) Check that the receiver_email is an email address registered in your PayPal account.
                    // 10. Check that the price (carried in mc_gross) and the currency (carried in mc_currency) are correct for the item (carried in item_name or item_number).
                    // console.log({product_name})
                    planDb.getPlanByName(product_name).then(([
                        plan
                    ]) => {
                        // console.log({plan})
                        if (!plan || mc_currency !== "USD" || mc_gross != plan.price) return console.log("plan: false information")
                        else {
                            // console.log("payment successful and verified")
                            getUserByPayPalSubscriptionId(recurring_payment_id).then(([user]) => {
                                getSubscriberById(user.id).then(([subscriber]) => {
                                    const subscriptionData = {
                                        user_id: user.id,
                                        plan_id: plan.id,
                                        subscribe_start: Date.now(),
                                        subscribe_end: Date.now() + (day * plan.day_length)
                                    }
                                    if (subscriber) updateSubscription(subscriber.id, subscriptionData).then(null)
                                    else insertSubscription(subscriptionData).then(() =>
                                        createInvoice(user, plan)
                                    )
                                })
                            })
                        }
                    })
                }
            } //! subscription canceling
            else if (txn_type === "recurring_payment_profile_cancel") {
                // console.log("txn_type is canceling subscription")
                getUserByPayPalSubscriptionId(recurring_payment_id).then(([user]) => {
                    if (user) {
                        user.active_subscription = false;
                        user.payPal_subscription_id = null;
                        removeSubscription(user.id).then(null)
                        updateUser(user).then(null)
                        // console.log(`User ${user.id} has successfully unsubscribed`)
                    }
                    // else console.log("no user found")
                })
            } //! Offer Purchase
            else if (txn_type === "cart" && existingSuccessIPN === false) {
                // console.log("txn_type if a offer purchase")
                offerDb.getOfferByName(item_name1).then(([
                    offer
                ]) => {
                    if (!offer || mc_currency !== "USD" || mc_gross != offer.price) return console.log("offer: false information")
                    else getUserByPayPalTransactionId(txn_id).then(([user]) => {
                        if (user) {
                            user.payPal_transaction_id = null
                            createInvoice(user, offer)
                        }
                    })

                })
            }
        }
    }, productionEnv);
})

//todo *feature* change webhook listener to only get updates
router.post("/webhook", (req, res) => {
    console.log("🪝", req.body)
    //! https://developer.paypal.com/docs/api-basics/notifications/webhooks/
    //! https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/
    // webhook.notification.webhookEvent.verify(req.headers, req.body, process.env.PAYPAL_WEBHOOK_ID, function (err, response) {
    //     if (err) {
    //         console.log({
    //             err
    //         });
    //         throw error;
    //     } else {
    //         console.log({
    //             response
    //         });

    //         // Verification status must be SUCCESS
    //         if (response.verification_status === "SUCCESS") {
    //             console.log("It was a success.");
    //         } else {
    //             console.log("It was a failed verification");
    //         }
    //     }
    // });
})

router.post("/purchase", (req, res) => {
    // update user with subscription ID for upgrade/cancel (IPN)
    const {
        user_id,
        subscriptionID,
        transaction_id
    } = req.body;

    getUserById(user_id).then(([user]) => {
        // for subscriptions
        if (subscriptionID) user.payPal_subscription_id = subscriptionID;
        // for offers
        if (transaction_id) {
            user.payPal_transaction_id = transaction_id
            // payPalDb.insertTransaction(transaction_id).then(null)
        }
        updateUser(user).then(() => res.status(200).json("User updated"))
    })
    // for offers
})

router.get("/creds", (req, res) => {
    // get PayPal credentials for subscription auth
    const {
        PAYPAL_CLIENT_ID_SANDBOX,
        PAYPAL_SECRET_SANDBOX,
        PAYPAL_CLIENT_ID_LIVE,
        PAYPAL_SECRET_LIVE
    } = process.env;
    const config = {
        method: 'post',
        url: `https://api-m.${production_mode ? '' : 'sandbox.'}paypal.com/v1/oauth2/token`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
            username: productionEnv ? PAYPAL_CLIENT_ID_LIVE : PAYPAL_CLIENT_ID_SANDBOX,
            password: productionEnv ? PAYPAL_SECRET_LIVE : PAYPAL_SECRET_SANDBOX
        },
        data: "grant_type=client_credentials"
    };
    axios(config)
        .then((response) => res.status(200).json(response.data.access_token))
        .catch((error) => {
            console.error(error)
            res.status(500).send()
        })

})


router.use("/", (req, res) => {
    res.status(200).json({
        Route: "PayPal Route"
    });
});


module.exports = router;
