"use strict";

class HamburgerMenu extends React.Component {
  constructor(props) {
    const token = window.localStorage.getItem("samplehousetoken");
    super(props);
    this.state = {
      open: false,
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

    const menu = document.querySelector("#menu");
    const links = document.querySelectorAll("#menu a");

    //* On click of link, close navigation
    if (links.length && !links[0].onclick)
      links.forEach((l) => (l.onclick = () => this.setState({ open: false })));

    if (this.state.open) menu.style.display = "block";
    else if (!this.state.open && menu) menu.style.display = "none";

    // document.addEventListener("click");
    return (
      <div className="menu-wrapper">
        <div id="menuToggle">
          {/* <!--
    A fake / hidden checkbox is used as click reciever,
    so you can use the :checked selector on it.
    --> */}

          <input
            type="checkbox"
            onClick={() => this.setState({ open: !this.state.open })}
          />
          {/* Spans act as a hamburger */}
          <span className="hamburger-span" />
          <span className="hamburger-span" />
          <span className="hamburger-span" />

          {!loggedIn ? (
            <ul id="menu">
              <li>
                <a href="/#">HOME</a>
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
            <ul id="menu">
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
        </div>
        <div className="right">
          {!loggedIn ? (
            <div className="actions">
              <a href="authentication#">LOGIN</a>
              <a href="authentication#">SIGN UP</a>
            </div>
          ) : (
            <div className="actions">
              <a href="subscriptions" className="subscribe-here">
                Plans
              </a>
              <a href="account" className="profile-btn">
                {userInitials}
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
            </div>
          )}
          <a href={!loggedIn ? "/#" : "home#"}>
            <picture>
              <source
                srcset="../assets/sample_house_logo-chrome.webp"
                alt="SampleHouse Logo"
                type="image/webp"
              />
              <img
                src="../assets/sample_house_logo-chrome.png"
                alt="SampleHouse Logo"
              />
            </picture>
          </a>
        </div>
      </div>
    );
  }
}

const domContainer = document.querySelector("#hamburger-menu");
ReactDOM.render(React.createElement(HamburgerMenu), domContainer);
