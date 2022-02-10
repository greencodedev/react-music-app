"use strict";
// #emailSucReg=braden@bluesmokemedia.net

class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      regEmail: "",
      regPassword: "",
      fname: "",
      lname: "",
      errors: [],
      successMsg: null,
    };
  }
  onSubmitHandler = (evt) => {
    evt.preventDefault();
    // console.log(evt);
    const { regEmail, regPassword, fname, lname } = this.state;
    const errState = { ...this.state, errors: [] };
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(regEmail.toLowerCase()))
      errState.errors = ["Please enter a valid Email address."];
    if (regPassword.length < 7)
      errState.errors = [
        ...errState.errors,
        "Password must have a minimum of 6 characters.",
      ];
    if (fname.length < 3)
      errState.errors = [...errState.errors, "Please enter your first name."];
    if (errState.errors.length) return this.setState(errState);

    const submitFetch = async () =>
      await fetch("localhost:5001/api/user/register", {
        // await fetch("http://localhost:5000/api/user/register", {
        method: "POST",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          first_name: fname,
          last_name: lname.length ? lname : "",
        }),
      }).then(async (res) => ({ status: res.status, data: await res.json() }));

    submitFetch().then(({ status, data }) => {
      window.location.hash = "#";
      if (status !== 200)
        return this.setState({ ...this.state, errors: [data.msg] });
      // console.log(data.msg);
      // const emailHash = hash.replace("#emailSucReg=", "");
      this.setState({
        ...this.state,
        regEmail: "",
        regPassword: "",
        fname: "",
        lname: "",
        errors: [],
        successMsg: `A confirmation Email has been sent to ${this.state.regEmail}. In case you did not receive the verification Email, please be sure to check your spam folder.`,
      });
      // window.location.hash = `emailSucReg=${this.state.regEmail}`;
    });
  };
  onChangeHandler = (evt) => {
    this.setState({
      ...this.state,
      [evt.target.name]: evt.target.value,
    });
  };

  render() {
    // const hash = window.location.hash;
    // if (hash && !this.state.successMsg)
    //   if (hash.includes("#emailSucReg=")) {
    //     const emailHash = hash.replace("#emailSucReg=", "");
    //     this.setState({
    //       ...this.state,
    //       successMsg: `A confirmation Email has been sent to ${emailHash}. In case you did not receive the verification Email, please be sure to check your spam folder.`,
    //     });
    //   }
    return (
      <form
        name="registerForm"
        id="registerForm"
        onSubmit={this.onSubmitHandler}
      >
        <p className="info">
          Please enter your Email address and a password to create an account.
        </p>
        <span className="success">{this.state.successMsg}</span>
        <div className="errors">
          {this.state.errors.map((e, i) => (
            <p key={i} className="error">
              &#42;{e}
            </p>
          ))}
        </div>
        <div className="name">
          <div>
            <label htmlFor="fname">&#42;First Name</label>
            <input
              type="text"
              name="fname"
              onChange={this.onChangeHandler}
              value={this.state.fname}
              required
            />
          </div>
          <div>
            <label htmlFor="lname">Last Name</label>
            <input
              type="text"
              name="lname"
              onChange={this.onChangeHandler}
              value={this.state.lname}
            />
          </div>
        </div>
        <label htmlFor="regEmail">&#42;Email Address</label>
        <input
          type="text"
          name="regEmail"
          onChange={this.onChangeHandler}
          value={this.state.regEmail}
          required
        />
        <label htmlFor="regPassword">&#42;Password</label>
        <input
          type="password"
          name="regPassword"
          onChange={this.onChangeHandler}
          value={this.state.regPassword}
          required
        />
        <button type="submit">
          <picture>
            <source
              srcset="../assets/half-man.webp"
              alt="half-man"
              type="image/webp"
            />
            <img src="../assets/half-man.png" alt="half-man" />
          </picture>
          CREATE YOUR ACCOUNT
        </button>
      </form>
    );
  }
}

const domContainer = document.querySelector("#register");
ReactDOM.render(React.createElement(RegisterForm), domContainer);
