"use strict";

class ContactForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      subject: "",
      message: "",
      antiSpam: "",
      errors: [],
      successMsg: null,
    };
  }
  onSubmitHandler = (evt) => {
    evt.preventDefault();
    const { email, name, subject, message } = this.state;
    const errState = { ...this.state, errors: [] };
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(email.toLowerCase()))
      errState.errors = ["Please enter a valid Email address."];
    if (name.length < 3)
      errState.errors = [...errState.errors, "Please enter your name."];
    if (errState.errors.length) return this.setState(errState);

    const submitFetch = async () =>
      await fetch("localhost:5001/api/contact", {
        method: "POST",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      }).then(async (res) => ({ status: res.status, data: await res.json() }));
    if (this.state.antiSpam)
      return this.setState({
        ...this.state,
        errors: [],
        successMsg: "Anti-Spam has been invoked.",
      });
    submitFetch().then(({ status, data }) => {
      if (status !== 200)
        return this.setState({ ...this.state, errors: [data.msg] });
      // window.location.hash = `contactSuccessful`;
      return this.setState({
        ...this.state,
        successMsg: data.msg,
        name: "",
        email: "",
        subject: "",
        message: "",
        errors: [],
      });
    });
  };
  onChangeHandler = (evt) => {
    this.setState({
      ...this.state,
      [evt.target.name]: evt.target.value,
    });
  };

  // componentDidMount() {
  //   if (
  //     window.location.hash &&
  //     window.location.hash.includes("#contactSuccessful")
  //   ) {
  //     window.location.hash = "#";
  //     this.setState({
  //       ...this.state,
  //       successMsg: `Successfully submitted. Please expect a reply within 48-72 hours.`,
  //     });
  //   }
  // }

  render() {
    return (
      <form name="contactForm" id="contactForm" onSubmit={this.onSubmitHandler}>
        <span className="success">{this.state.successMsg}</span>
        <div className="errors">
          {this.state.errors.map((e, i) => (
            <p key={i} className="error">
              &#42;{e}
            </p>
          ))}
        </div>
        <label htmlFor="name">&#42;Name</label>
        <input
          type="text"
          name="name"
          onChange={this.onChangeHandler}
          value={this.state.name}
          required
        />
        <label htmlFor="email">&#42;Email Address</label>
        <input
          type="text"
          name="email"
          onChange={this.onChangeHandler}
          value={this.state.email}
          required
        />
        <label htmlFor="subject">&#42;Subject</label>
        <input
          type="text"
          name="subject"
          onChange={this.onChangeHandler}
          value={this.state.subject}
          required
        />
        <label htmlFor="message">&#42;Message</label>
        <textarea
          type="textarea"
          name="message"
          onChange={this.onChangeHandler}
          value={this.state.message}
          //   rows="4"
          //   cols="40"
          maxLength="500"
          required
        />
        <input
          type="hidden"
          name="anti-spam"
          onChange={this.onChangeHandler}
          value={this.state.antiSpam}
          class="anti-spam"
          style={{ display: "none", position: "absolute" }}
        />
        <span className="text-counter">{500 - this.state.message.length}</span>
        <button type="submit">
          <picture>
            <source
              srcset="../assets/half-man.webp"
              alt="half-man"
              type="image/webp"
            />
            <img
              src="../assets/half-man.png"
              alt="404 chrome image"
              class="chrome-404"
            />
          </picture>
          Submit
        </button>
      </form>
    );
  }
}

const domContainer = document.querySelector("#contact");
ReactDOM.render(React.createElement(ContactForm), domContainer);
