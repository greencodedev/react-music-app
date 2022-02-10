"use strict";

class Footer extends React.Component {
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
      <div>
        <div className="top">
          <a href={!loggedIn ? "/#" : "home#"}>
            <div className="logo">
              <picture>
                <source
                  srcset="../assets/sample_house_logo-chrome.webp"
                  alt="Sample.House Logo"
                  type="image/webp"
                />
                <img
                  src="../assets/sample_house_logo-chrome.png"
                  alt="Sample.House Logo"
                />
              </picture>
              <h1>SampleHouse</h1>
            </div>
          </a>
          <div className="right">
            <p>
              Contact us through our
              <a href="contact">CONTACT FORM</a>
              or Email at:
              <a href="mailto:support@sample.house">support@sample.house.</a>
            </p>
            <div className="tos-wrapper">
              <a href="privacy-policy-terms">Privacy and Terms Of Service</a>
              <div className="sm">
                <a href="https://www.youtube.com/c/SampleHouse" target="_blank">
                  <picture>
                    <source
                      srcset="../assets/youtube_icon.webp"
                      alt="Youtube Icon"
                      type="image/webp"
                    />
                    <img src="../assets/youtube_icon.png" alt="Youtube Icon" />
                  </picture>
                </a>
                <a href="https://twitter.com/Sample_House" target="_blank">
                  <picture>
                    <source
                      srcset="../assets/twitter_icon.webp"
                      alt="Twitter Icon"
                      type="image/webp"
                    />
                    <img src="../assets/twitter_icon.png" alt="Twitter Icon" />
                  </picture>
                </a>
                <a
                  href="https://www.facebook.com/SampleHouseOfficial"
                  target="_blank"
                >
                  <picture>
                    <source
                      srcset="../assets/facebook_icon.webp"
                      alt="Facebook Icon"
                      type="image/webp"
                    />
                    <img
                      src="../assets/facebook_icon.png"
                      alt="Facebook Icon"
                    />
                  </picture>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="bottom">
          <a
            href="https://www.bluesmokedigitalandprintedmedia.com"
            target="_blank"
          >
            <p>
              Organic SEO, Web Design and Development by Blue Smoke Digital and
              Printed Media
            </p>
          </a>
          <a
            href="https://www.bluesmokedigitalandprintedmedia.com"
            style={{ margin: "auto" }}
          >
            <picture>
              <source
                srcset="../assets/blue_smoke_media_graphic_link.webp"
                alt="Blue Smoke Logo"
                type="image/webp"
              />
              <img
                src="../assets/blue_smoke_media_graphic_link.png"
                alt="Blue Smoke Logo"
              />
            </picture>
          </a>
          <p>© Copyright 2021 SampleHouse</p>
        </div>
      </div>
    );
  }
}

const domContainer = document.querySelector("#footer");
ReactDOM.render(React.createElement(Footer), domContainer);
