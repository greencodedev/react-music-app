"use strict";

class forgotPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      errorMsg: null,
      successMsg: null,
    };
  }
  verifyEmail = () => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(this.state.email.toLowerCase())) {
      this.setState({ ...this.state, errorMsg: null });
      return true;
    }
    this.setState({
      ...this.state,
      errorMsg: "Please enter a valid Email address.",
    });
    return false;
  };
  onSubmitHandler = (evt) => {
    evt.preventDefault();
    // window.location.hash = "#";
    // ? clear error Msg?
    // this.setState({ ...this.state, successMsg: null });
    if (!this.verifyEmail()) return;

    const submitFetch = async () =>
      await fetch("localhost:5001/api/user/forgotPassword", {
        method: "POST",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: this.state.email,
        }),
      }).then(async (res) => ({ status: res.status, data: await res.json() }));

    submitFetch().then(({ status, data }) => {
      // console.log(status, data);
      if (status !== 200) this.setState({ ...this.state, errorMsg: data.msg });
      else
        this.setState({
          ...this.state,
          successMsg: `A Email as been sent to ${this.state.email} with a link to reset your password. This link will expire in 6 hours. In case you did not receive the password reset link Email, please be sure to check your spam folder.`,
        });
    });
  };

  onChangeHandler = (evt) => {
    this.setState({
      ...this.state,
      [evt.target.name]: evt.target.value,
    });
  };

  componentDidMount() {}

  render() {
    // console.log("state", this.state);
    if (window.location.hash) {
      //* Autofill email from login form
      // console.log(window.location.hash);
      if (window.location.hash.includes("#forgot=")) {
        const forgotHash = window.location.hash.replace("#forgot=", "");
        this.setState({ ...this.state, email: forgotHash });
      }
      window.location.hash = "#";
    }

    return (
      <form
        name="forgotPasswordForm"
        id="forgotPasswordForm"
        onSubmit={this.onSubmitHandler}
      >
        <h1>Forgot Password</h1>
        <p className="error">{this.state.errorMsg}</p>
        <p
          className="success"
          style={{ display: this.state.successMsg ? "block" : "none" }}
        >
          {this.state.successMsg}
        </p>
        <label htmlFor="email">
          Email Address:
          <input
            type="text"
            name="email"
            onChange={this.onChangeHandler}
            value={this.state.email}
            required
          />
        </label>
        <button type="submit">
          <picture>
            <source srcset="../assets/lock.webp" alt="Lock" type="image/webp" />
            <img src="../assets/lock.webp" alt="Lock" />
            Submit
          </picture>
        </button>
      </form>
    );
  }
}

const domContainer = document.querySelector("#forgotPassword");
ReactDOM.render(React.createElement(forgotPassword), domContainer);
