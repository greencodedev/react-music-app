"use strict";

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      logEmail: "",
      logPassword: "",
      errorMsg: null,
      resendSuccessMsg: null,
      verified: true,
      validEmail: true,
    };
  }
  verifyEmail = () => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(this.state.logEmail.toLowerCase())) return true;
    this.setState({
      ...this.state,
      errorMsg: "Please enter a valid Email address.",
      verified: true,
    });
    return false;
  };

  onSubmitHandler = (evt) => {
    evt.preventDefault();
    const regSuccess = document.querySelector(".success");
    if (regSuccess) regSuccess.style.display = "none";
    this.setState({ ...this.state, resendSuccessMsg: null });
    if (!this.verifyEmail()) return;
    const submitFetch = async () =>
      await fetch("localhost:5001/api/user/login", {
        method: "POST",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: this.state.logEmail,
          password: this.state.logPassword,
        }),
      });

    submitFetch()
      .then(async (res) => ({ status: res.status, data: await res.json() }))
      .then(({ status, data }) => {
        // console.log(status, data);
        this.setState({ ...this.state, verified: true });
        if (status === 401) this.setState({ ...this.state, verified: false });
        if (status !== 200)
          this.setState({ ...this.state, errorMsg: data.msg });
        else {
          window.localStorage.setItem("samplehousetoken", data.token);
          window.location.href = "home";
        }
      });
  };

  resendVerification = (evt) => {
    evt.preventDefault();
    const regSuccess = document.querySelector(".success");
    if (regSuccess) regSuccess.style.display = "none";
    if (!this.verifyEmail()) return;
    const submitFetch = async () =>
      await fetch("localhost:5001/api/token/resend", {
        method: "POST",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: this.state.logEmail,
        }),
      }).then(async (res) => ({ status: res.status, data: await res.json() }));

    submitFetch().then(({ status, data }) => {
      // console.log(status, data.msg);
      if (status !== 200) this.setState({ ...this.state, errorMsg: data.msg });
      //* autofill email on successful verification resend
      else
        this.setState({
          ...this.state,
          resendSuccessMsg: `A confirmation Email has been re-sent to ${this.state.logEmail}. If  you did not receive the verification Email, please be sure to check your spam folder.`,
          // logEmail: resendHash,
          errorMsg: "",
        });
      // window.location.hash = `resend=${this.state.logEmail}`;
    });
  };

  onChangeHandler = (evt) => {
    this.setState({
      ...this.state,
      [evt.target.name]: evt.target.value,
    });
  };

  componentDidMount() {
    if (window.location.hash) {
      //* autofill email on successful register
      if (window.location.hash.includes("#emailSucReg=")) {
        const emailHash = window.location.hash.replace("#emailSucReg=", "");
        this.setState({ ...this.state, logEmail: emailHash });
      }
      // else if (window.location.hash.includes("#resend")) {
      //   const resendHash = window.location.hash.replace("#resend=", "");
      //   this.setState({
      //     ...this.state,
      //     resendSuccessMsg: `A confirmation Email has been re-sent to ${resendHash}. If  you did not receive the verification Email, please be sure to check your spam folder.`,
      //     logEmail: resendHash,
      //   });
      // }
      else if (window.location.hash.includes("#emailSucReset=")) {
        const emailSucResetHash = window.location.hash.replace(
          "#emailSucReset=",
          ""
        );
        // console.log(window.location.hash, emailSucResetHash);
        this.setState({ ...this.state, logEmail: emailSucResetHash });
      }
      window.location.hash = "#";
    }
  }

  render() {
    const { logEmail } = this.state;
    return (
      <form name="loginForm" id="loginForm" onSubmit={this.onSubmitHandler}>
        <div className="errors">
          <p className="error">
            {this.state.errorMsg}
            {/* //? errorMsg isn't clearing... */}
            {!this.state.verified ? (
              <span onClick={this.resendVerification}>
                Click here to resend confirmation email.
              </span>
            ) : null}
          </p>
        </div>
        <p
          className="success"
          style={{ display: this.state.resendSuccessMsg ? "block" : "none" }}
        >
          {this.state.resendSuccessMsg}
        </p>
        <label htmlFor="logEmail">Email Address</label>
        <input
          type="text"
          name="logEmail"
          onChange={this.onChangeHandler}
          value={this.state.logEmail}
          required
        />
        <label htmlFor="logPassword">Password</label>
        <input
          type="password"
          name="logPassword"
          onChange={this.onChangeHandler}
          value={this.state.logPassword}
          required
        />
        <a href={`forgot-password${logEmail ? "#forgot=" + logEmail : ""}`}>
          Forgot Password?
        </a>
        <button type="submit">
          <picture>
            <source srcset="../assets/lock.webp" alt="Lock" type="image/webp" />
            <img src="../assets/lock.webp" alt="lock" />
          </picture>
          SIGN IN
        </button>
      </form>
    );
  }
}

const domContainer = document.querySelector("#login");
ReactDOM.render(React.createElement(LoginForm), domContainer);
