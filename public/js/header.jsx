"use strict";
class Header extends React.Component {
  constructor(props) {
    const token = window.localStorage.getItem("samplehousetoken");
    super(props);
    this.state = {
      token,
      loggedIn: token && jwt_verify(jwt_decode(token)),
      userId: token ? jwt_decode(token).subject : false,
      userInitials: "",
    };
  }
  async componentDidMount() {
    const { loggedIn } = this.state;
    let userInitials = window.localStorage.getItem("samplehouseuser");

    if (!userInitials && loggedIn) {
      const user = await fetch(
        `localhost:5001/api/user/${this.state.userId}`,
        {
          method: "GET",
          type: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).then(async (res) => await res.json());
      userInitials = user.first_name[0];
      if (user.last_name.length) userInitials += user.last_name[0];
      window.localStorage.setItem("samplehouseuser", userInitials);
    }
    this.setState({
      ...this.state,
      userInitials,
    });
  }

  render() {
    const { loggedIn, userInitials } = this.state;
    return (
      <div>
        <a href={!loggedIn ? "/#" : "home#"}>
          <div className="logo">
            <picture>
              <source
                srcset="../assets/sample_house_logo-chrome.webp"
                alt="SampleHouse Logo"
              />
              <img
                src="../assets/sample_house_logo-chrome.png"
                alt="sample.House Logo"
              />
            </picture>
            <h1>SampleHouse</h1>
          </div>
        </a>
        <div className="right">
          <div className="top-actions">
            <a className="email" href="mailto:support@sample.house">
              <picture>
                <source
                  srcset="../assets/envelope-square.webp"
                  alt="Square Envelope"
                />
                <img
                  src="../assets/envelope-square.png"
                  alt="Square Envelope"
                />
              </picture>
              support@sample.house
            </a>
            {!loggedIn ? (
              <div className="buttons">
                <a href="authentication#" className="login-btn">
                  LOGIN
                </a>
                <a href="authentication#">SIGN UP</a>
              </div>
            ) : (
              <div className="buttons">
                <a href="subscriptions" className="subscribe-here">
                  Plans
                </a>
                <a
                  href="/"
                  onClick={() => {
                    window.localStorage.removeItem("samplehousetoken");
                    window.localStorage.removeItem("samplehouseuser");
                  }}
                  className="logout-btn"
                >
                  LOGOUT
                </a>
                <a href="account" className="profile-btn">
                  {userInitials}
                </a>
              </div>
            )}
          </div>
          <nav>
            {!loggedIn ? (
              <ul>
                <li>
                  <a href="/">HOME</a>
                </li>
                <li>
                  <a href="/#about">ABOUT</a>
                </li>
                <li>
                  <a href="/#products">PRODUCTS</a>
                </li>
                <li>
                  <a href="/#pricing">PRICING</a>
                </li>
                <li>
                  <a href="/#faq">FAQ's</a>
                </li>
                <li>
                  <a href="contact">CONTACT</a>
                </li>
              </ul>
            ) : (
              <ul>
                <li>
                  <a href="home#">SOUNDS</a>
                </li>
                <li>
                  <a href="plugins">PLUGINS</a>
                  {/* download link for VST IMG w/ Title, Desc w/ download button*/}
                </li>
                <li>
                  <a href="sample-packs">SAMPLEPACKS</a>
                  {/* grid out with pack's img and title --> packs page */}
                </li>
                <li>
                  <a href="offers">OFFERS</a>
                  {/* grid out video w/ img and title */}
                  {/* tier 2+ only, w/ upgrade btn  and go back btn-->  */}
                  {/* youtube private channel link */}
                </li>
                <li>
                  <a href="https://discord.gg/aUGfJMm7MS" target="_blank">
                    DISCORD
                  </a>
                </li>
                <li>
                  <a href="contact">CONTACT</a>
                </li>
              </ul>
            )}
          </nav>
        </div>
      </div>
    );
  }
}

const domContainer = document.querySelector("#header");
ReactDOM.render(React.createElement(Header), domContainer);
