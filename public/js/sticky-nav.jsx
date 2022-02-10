"use strict";

class StickyNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
    };
  }

  componentDidMount() {
    const token = window.localStorage.getItem("samplehousetoken");
    if (token && jwt_verify(jwt_decode(token)))
      this.setState({ loggedIn: true });
  }

  render() {
    const { loggedIn } = this.state;
    return (
      <nav>
        {!loggedIn ? (
          <ul>
            <a href="/#">
              <picture>
                <source
                  srcset="../assets/sample_house_logo-chrome.webp"
                  alt="SoundHouse Logo"
                  type="image/webp"
                />
                <img
                  src="../assets/sample_house_logo-chrome.png"
                  alt="SoundHouse Logo"
                />
              </picture>
            </a>
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
          <ul>
            <a href="home#">
              <picture>
                <source
                  srcset="../assets/sample_house_logo-chrome.webp"
                  alt="SoundHouse Logo"
                  type="image/webp"
                />
                <img
                  src="../assets/sample_house_logo-chrome.png"
                  alt="SoundHouse Logo"
                />
              </picture>
            </a>
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
    );
  }
}

const domContainer = document.querySelector("#sticky-nav");
ReactDOM.render(React.createElement(StickyNav), domContainer);

const observer = new IntersectionObserver(
  (entries) => {
    const nav = document.querySelector("#sticky-nav").style;
    // isIntersecting is true when element and viewport are overlapping
    // isIntersecting is false when element and viewport don't overlap
    if (entries[0].isIntersecting === false) nav.display = "block";
    else nav.display = "none";
  },
  { threshold: [0] }
);

observer.observe(document.querySelector("#header"));
