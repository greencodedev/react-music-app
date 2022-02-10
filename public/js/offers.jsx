"use strict";
class Offers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      user: {},
      token: window.localStorage.getItem("samplehousetoken"),
      selectedOffer: {},
    };
  }

  selectOffer = (index, name, price) => {
    if (name !== this.state.selectedOffer.name) {
      this.setState({
        ...this.state,
        selectedOffer: {
          name,
          price,
        },
      });
      const cards = document.querySelectorAll(".card");
      cards.forEach((e) => (e.style.border = "1px solid #c3c1c1"));
      cards[index].style.border = "3px solid #c3c1c1";
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
    }).then(async (res) => (user = await res.json()));

    await fetch("localhost:5001/api/product/offers", {
      method: "GET",
      type: "cors",
      headers: {
        "Content-Type": "application/json",
        authorization: this.state.token,
      },
    }).then(async (res) => {
      res = await res.json();
      const data = [];
      res.forEach((e) => data.push(e));
      this.setState({
        ...this.state,
        data,
        user,
        selectedOffer: data[0],
      });
      const card = document.querySelector(".card");
      if (card) card.style.border = "3px solid #c3c1c1";
    });
  }

  componentDidUpdate() {
    const { user, selectedOffer } = this.state;
    const payPalBtnContainer = document.querySelector(
      "#paypal-button-container"
    );
    if (payPalBtnContainer) {
      payPalBtnContainer.innerHTML = "";
      createPayPalButtons(selectedOffer, user.id);
    }
  }

  render() {
    const { active_subscription } = this.state.user;

    return active_subscription ? (
      <div>
        <div id="offer-cards">
          {this.state.data.map(({ name, credits, price, discount }, i) => (
            <div
              className="card"
              key={i}
              onClick={() => this.selectOffer(i, name, price)}
            >
              {i > 0 ? (
                <span className="discount">Save {discount}%</span>
              ) : null}
              <h2>{name}</h2>
              <div className="info">
                <p className="credits">
                  SAMPLEHOUSE
                  <br />
                  DOWNLOAD CREDITS
                </p>
                {/* <p className="credits">{credits} Credits</p> */}
                <p className="price">${price}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="payment">
          <h3>Choose Your Payment Type</h3>
          <div id="paypal-button-container"></div>
        </div>
      </div>
    ) : (
      <h2 className="no-subscription">
        Only active subscribers can take advantage of offers.{" "}
        <a href="subscriptions">Choose your membership plan.</a>
      </h2>
    );
  }
}

const domContainer = document.querySelector("#offers");
ReactDOM.render(React.createElement(Offers), domContainer);

function createPayPalButtons(offer, user_id) {
  // console.log(offer, user_id);
  paypal
    .Buttons({
      createOrder: function (data, actions) {
        // This function sets up the details of the transaction, including the amount and line item details.
        return actions.order.create({
          custom: "custom",
          purchase_units: [
            {
              amount: {
                value: offer.price,
                currency_code: "USD",
                breakdown: {
                  item_total: { value: offer.price, currency_code: "USD" },
                },
              },
              items: [
                {
                  name: offer.name,
                  unit_amount: { value: offer.price, currency_code: "USD" },
                  quantity: "1",
                },
              ],
            },
          ],
        });
      },
      onApprove: function (data, actions) {
        // This function captures the funds from the transaction.
        return actions.order.capture().then((details) => {
          // console.log("onApprove", { data, details });
          const transaction_id =
            details.purchase_units[0].payments.captures[0].id;

          fetch(`localhost:5001/api/paypal/purchase`, {
            method: "POST",
            type: "cors",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id,
              transaction_id,
            }),
          }).then(() => (window.location = `success#offer-${offer.name}`));
        });
      },
      onCancel: function (data) {
        // console.log("onCancel", data);
        // Show a cancel page, or return to cart
        alert(`You have canceled the purchase for ${offer.name}.`);
      },
      onError: function (err) {
        // console.log(err);
        window.location = "404#error";
      },
    })
    .render("#paypal-button-container");
}
