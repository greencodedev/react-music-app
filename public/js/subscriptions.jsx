"use strict";
class Subscriptions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      plan_name: "",
      payPal_id: "",
      // selectedPlan: {}, //todo refactor to store whole plan
      user: {},
      token: window.localStorage.getItem("samplehousetoken"),
    };
  }

  selectSubscription = (cardIndex, plan_name, payPal_id) => {
    if (plan_name !== this.state.plan_name) {
      this.setState({
        ...this.state,
        payPal_id,
        plan_name,
      });
      const cards = document.querySelectorAll(".card");
      cards.forEach((e) => (e.style.border = "4px solid #0f495f"));
      cards[cardIndex].style.border = "2px solid #c3c1c1";
      // select current plan
      if (this.state.user.currentPlanId)
        document.querySelectorAll(".card")[
          this.state.user.currentPlanId - 1
        ].style.border = "2px solid lime";
    }
  };

  async componentDidMount() {
    const id = jwt_decode(this.state.token).subject;
    let user;
    await fetch(`localhost:5001/api/user/${id}`, {
      method: "GET",
      type: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => await res.json())
      .then((resp) => (user = resp));

    await fetch("localhost:5001/api/product/plans", {
      method: "GET",
      type: "cors",
      headers: {
        "Content-Type": "application/json",
        authorization: this.state.token,
      },
    })
      .then(async (res) => await res.json())
      .then((resp) => {
        // console.log(resp);
        const data = [];
        let userCurrentPlan = "";
        // console.log("id", user);
        resp.forEach((e) => {
          if (user.currentPlanId && e.id == user.currentPlanId)
            userCurrentPlan = e;
          return data.push(e);
        });
        this.setState({
          ...this.state,
          data,
          user,
          plan_name: data[0].name,
          payPal_id: data[0].payPal_id,
          userCurrentPlan,
        });
      })
      .then(() => {
        document.querySelector(".card").style.border = "3px solid #c3c1c1";
        if (this.state.user.currentPlanId)
          document.querySelectorAll(".card")[
            user.currentPlanId - 1
          ].style.border = "3px solid lime";
      });
  }

  componentDidUpdate() {
    const { user, payPal_id, plan_name } = this.state;
    if (!user.active_subscription) {
      const payPalBtnContainer = document.querySelector(
        "#paypal-button-container"
      );
      if (payPalBtnContainer) payPalBtnContainer.innerHTML = "";
      createPayPalButtons(payPal_id, plan_name, user.id);
    }
  }

  render() {
    const { userCurrentPlan, payPal_id } = this.state;
    const { active_subscription, payPal_subscription_id } = this.state.user;
    // console.log({ payPal_id });

    return (
      <div>
        {active_subscription ? (
          <h3 className="subscription-plan">
            Your current subscription plan is: {userCurrentPlan.name}
          </h3>
        ) : null}
        <div id="subscription-cards">
          {this.state.data.map(
            ({ name, credits, price, discount, included, payPal_id }, i) => (
              <div
                className="card"
                key={i}
                onClick={() => this.selectSubscription(i, name, payPal_id)}
              >
                {i > 0 ? (
                  <span className="discount">Save {discount}%</span>
                ) : null}
                <h2>{name}</h2>
                <div className="info">
                  <p className="download">
                    monthly
                    <br />
                    samplehouse
                    <br />
                    download credits
                  </p>
                  <p className="credits">{credits} credits</p>
                  <p className="price">${price}</p>
                  <span className="month">per month</span>
                  <ul>
                    <li className="included">included in package</li>
                    {included.split(",").map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          )}
        </div>
        {
          !active_subscription ? (
            <div className="payment">
              <h3>Choose Your Payment Type</h3>
              <div id="paypal-button-container"></div>
            </div>
          ) : null
          // <button
          //   onClick={() => {
          //     userCurrentPlan.name !== this.state.plan_name
          //       ? updateSubscription(payPal_subscription_id, payPal_id)
          //       : null;
          //   }}
          // >
          //   Update Subscription
          // </button>
        }
      </div>
    );
  }
}

const domContainer = document.querySelector("#subscriptions");
ReactDOM.render(React.createElement(Subscriptions), domContainer);

function createPayPalButtons(plan_id, plan_name, user_id) {
  // console.log(plan_id, plan_name);
  paypal
    .Buttons({
      createSubscription: function (data, actions) {
        return actions.subscription.create({
          plan_id,
        });
      },
      onApprove: function (data, actions) {
        // console.log("onApprove", data);
        const { subscriptionID } = data;
        fetch(`localhost:5001/api/paypal/purchase`, {
          method: "POST",
          type: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id,
            subscriptionID,
          }),
        }).then(() => (window.location = `success#subscribe-${plan_name}`));
      },
      onCancel: function (data) {
        // console.log("onCancel", data);
        // Show a cancel page, or return to cart
        alert(
          `You have canceled the subscription to the subscription: ${plan_name}.`
        );
      },
      onError: function (err) {
        // console.log(err);
        window.location = "404#error";
      },
    })
    .render("#paypal-button-container");
}
/*
async function updateSubscription(subscription_id, plan_id) {
  const creds = await fetch(`localhost:5001/api/paypal/creds`, {
    method: "GET",
    type: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  }).then(async (res) => await res.json());

  console.log({ creds, subscription_id, plan_id });
  fetch(
    `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscription_id}/revise`,
    {
      method: "POST",
      type: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${creds}`,
      },
      body: JSON.stringify({
        plan_id,
      }),
    }
  )
    .then(async (res) => {
      if (res.status !== 200) return (window.location.hash = "error");
      return await res.json();
      // if (status === 204) return (window.location = "success#cancel");
      // else return (window.location = "404#error");
    })
    .then((resp) => {
      const link = resp["links"].find((e) => e.rel === "approve").href;
      console.log({ resp, link });
      window.open(link, "_blank");
    });
}

!https://www.paypal-support.com/s/account-overview# (braden@bluesmokemedia.net)
https://www.paypal-support.com/s/case/5002E00001iP2wLQAS/ipn
Hello Braden,
Thank you for reaching out to Merchant Technical Support.
I apologize for any frustration with your Subscription API calls. When you are using the subscription API, this is one of our REST API sets. OUr REST API sets do not use IPN, but rather, webhooks. Therefore, upon approval of the revision of the subscription, there will be a webhook sent out of  type BILLING.SUBSCRIPTION.UPDATED. In order to be notified of this, please make sure that the REST App that you are using is configured with a webhook listener, and that you are subscribed to all the events that you want to receive notifications for.

See https://developer.paypal.com/docs/api-basics/notifications/webhooks/event-names/ for a list of all webhook event names.

See the following page for advise on how to  get started in using webhooks.
https://developer.paypal.com/docs/api-basics/notifications/webhooks
*/
