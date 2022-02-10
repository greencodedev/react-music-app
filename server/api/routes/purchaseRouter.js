const router = require("express").Router();
const {
    validatePlan,
    validateOffer
} = require("../middleware/purchaseMiddleware");
const {
    insertSubscription,
    getSubscriberById,
    removeSubscription
} = require("../../../database/model/subscriptionModel");
const createInvoice = require("../utils/createInvoice");

const day = 86400000
router.post("/subscribe/:plan_name", validatePlan, (req, res) => {
    const {
        user,
        plan
    } = req;
    // console.log(req.body)
    user.payPal_subscription_id = req.body.subscriptionID
    getSubscriberById(user.id).then(([subscriber]) => {
        const subscriptionData = {
            user_id: user.id,
            plan_id: plan.id,
            subscribe_start: Date.now(),
            subscribe_end: Date.now() + (day * plan.day_length)
        }
        //* check if subscriber has MORE than 2 hours left on subscription
        if (subscriber && (subscriber.subscribe_end - Date.now()) > (day / 12))
            return res.status(200).send({
                msg: `You already has an active subscription. Subscription expires on: ${new Date(subscriber.subscribe_end).toLocaleDateString()}.`
            })
        else if (subscriber) removeSubscription(subscriber.id).then(null)

        insertSubscription(subscriptionData).then(() => {
            createInvoice(user, plan)
            res.status(200).send({
                msg: `Subscription to: ${plan.name} was successful.`
            })
        })
    })
});

router.get("/credits", validateOffer, async (req, res) => {
    const {
        user,
        offer
    } = req;

    getSubscriberById(user.id).then(([subscriber]) => {
        //* check if subscriber has LESS than 24 hours left on subscription
        if (!subscriber || (subscriber && (subscriber.subscribe_end - Date.now()) < day)) {
            if (subscriber) removeSubscription(subscriber.id).then(null)
            return res.status(200).send({
                msg: "User doesn't have an active subscription."
            })
        }
        if (paymentResponse = true) {
            createInvoice(user, offer)
            return res.status(200).send({
                msg: `Purchase of: ${offer.name} was successful. ${offer.credits} tokens have been added to your account. Your balance is: ${user.balance}.`
            })
        }
        // console.log("payment failed at new subscriber")
    })
})


router.use("/", (req, res) => {
    res.status(200).json({
        Route: "Purchase Route up"
    });
});

module.exports = router;

// function createInvoice(user, product) {
//     const user_id = user.id
//     const {
//         id,
//         product_type,
//         price,
//         credits,
//         tier
//     } = product

//     user.active_subscription = true
//     user.balance += credits

//     updateUser(user).then(null)
//     insertInvoice({
//         user_id,
//         product_type,
//         product_id: id,
//         amount: price, //? does this save as int or str
//         created: Date.now(),
//         // description:
//     }).then(null)
// }
