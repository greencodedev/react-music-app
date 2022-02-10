"use strict";
class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: window.localStorage.getItem("samplehousetoken"),
      user: {},
      covers: {},
      downloads: [],
      message: "",
    };
  }

  unsubscribe = async () => {
    const creds = await fetch(
      `localhost:5001/api/paypal/creds`,
      {
        method: "GET",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then(async (res) => await res.json());
    // console.log(this.state.user.subscription_id, await getCreds());
    // subscription_id = "I-R5MYP1JUL3LC" //! testing (use other subscriptions);

    fetch(
      `https://api-m.paypal.com/v1/billing/subscriptions/${this.state.user.payPal_subscription_id}/cancel`,
      // `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${this.state.user.payPal_subscription_id}/cancel`,
      {
        method: "POST",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${creds}`,
        },
      }
    ).then(({ status }) => {
      if (status === 204) return (window.location = "success#unsubscribe");
      else return (window.location = "404#error");
    });
  };

  async streamSound(sound, evt) {
    this.stopStreaming();
    const loadingSpinner = evt.target.classList;
    loadingSpinner.add("stream-spinner");
    //* make copy of sound to not overwrite .mid w/ .wav
    let soundName = sound.name + ".wav";
    if (soundName.includes(".mid")) soundName = soundName.replace(".mid", "");

    const data = await fetch(
      `localhost:5001/api/audio/stream/${encodeURIComponent(
        `${sound.pack}/${soundName}`
      )}`,
      {
        method: "GET",
        type: "cors",
        headers: {
          "Content-Type": "application/octet-stream",
          authorization: this.state.token,
        },
      }
    );

    //* if sound wasn't able to stream
    if (data.status === 404) {
      setTimeout(() => {
        this.setState({ ...this.state, message: "" });
      }, 2000);
      this.setState({
        ...this.state,
        message: "Unable to stream sound",
      });
      return loadingSpinner.remove("stream-spinner");
    }

    const context = new AudioContext();
    const source = context.createBufferSource(); //Create Sound Source
    this.setState({
      ...this.state,
      soundSourceNode: source,
      // loadingSoundStream: false,
    });
    return context.decodeAudioData(await data.arrayBuffer(), (buffer) => {
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(context.currentTime);
      loadingSpinner.remove("stream-spinner");
    });
  }

  stopStreaming() {
    const { soundSourceNode } = this.state;
    if (soundSourceNode) soundSourceNode.stop(0);
  }

  async download(sound) {
    if (this.state.message !== "")
      this.setState({ ...this.state, message: "" });
    let soundName = sound.name;
    if (soundName.toLowerCase().includes("midi"))
      soundName = soundName + ".mid";
    else soundName = soundName + ".wav";

    const res = await fetch(
      `localhost:5001/api/audio/download/${encodeURIComponent(
        `${sound.pack}/${soundName}`
      )}`,
      {
        method: "GET",
        type: "cors",
        headers: {
          "Content-Type": "application/octet-stream",
          authorization: this.state.token,
        },
      }
    );
    //* insufficient balance
    if (res.status === 222) {
      const data = await res.json();
      setTimeout(() => {
        this.setState({ ...this.state, message: "" });
      }, 3000);
      return this.setState({ ...this.state, message: data.msg });
    }
    //* new download
    else if (res.status === 225) {
      const creditCost = sound.exclusive ? 15 : 1;
      this.setState({
        ...this.state,
        user: {
          ...this.state.user,
          balance: this.state.user.balance - creditCost,
        },
      });
    } //* Already Downloaded
    else if (res.status === 226)
      this.setState({
        ...this.state,
        message: "Downloading sound",
      });
    //* 403-exclusive sound already downloaded by another user OR beta user trying to download exclusive
    //* 404-file was not able to be found in the s3 bucket
    if (res.status === 403 || res.status === 404) {
      const { msg } = await res.json();
      return this.setState({
        ...this.state,
        message: msg,
      });
    }
    const blob = new Blob([await res.arrayBuffer()], {
      type: `audio/${
        sound.name.toLowerCase().includes("midi") ? "midi" : "wav"
      }`,
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = sound.name;
    link.click();
    // console.log("link clicked for download");
    setTimeout(() => {
      this.setState({ ...this.state, message: "" });
    }, 3000);
  }

  async fetchCover(cover) {
    if (!(cover in this.state.covers)) {
      let res = await fetch(
        `localhost:5001/api/audio/cover/${encodeURIComponent(
          cover
        )}`,
        {
          method: "GET",
          type: "cors",
          headers: {
            "Content-Type": "image/png",
            authorization: this.state.token,
          },
        }
      );
      res = await res.json();
      const url = "data:image/png;base64," + encode(res.data);
      this.setState({
        ...this.state,
        covers: {
          ...this.state.covers,
          [cover]: url,
        },
      });
    }
  }

  async componentDidMount() {
    const id = jwt_decode(this.state.token).subject;
    const user = await fetch(
      `localhost:5001/api/user/${id}`,
      {
        method: "GET",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.state.token,
        },
      }
    ).then(async (res) => {
      const userData = await res.json();
      if (userData.active_subscription)
        await fetch(
          `localhost:5001/api/product/plan/${userData.currentPlanId}`,
          {
            method: "GET",
            type: "cors",
            headers: {
              "Content-Type": "application/json",
              Authorization: this.state.token,
            },
          }
        ).then(async (res) => {
          const plan = await res.json();
          return (userData.plan_name = plan[0].name);
        });
      return userData;
    });
    const downloads = await fetch(
      `localhost:5001/api/user/${id}/downloads`,
      {
        method: "GET",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.state.token,
        },
      }
    ).then(async (res) => await res.json());
    downloads.forEach(async (e) => (e ? await this.fetchCover(e.pack) : null));
    this.setState({ ...this.state, user, downloads });
  }

  render() {
    const {
      active_subscription,
      first_name,
      last_name,
      plan_name,
      balance,
    } = this.state.user;
    const { downloads, covers, message } = this.state;
    return (
      <div className="account-wrapper">
        <div className="profile-info">
          <h1>Account</h1>
          <p>
            Welcome {first_name} {last_name}
          </p>
          {active_subscription ? (
            <p className="plan">Your current subscription is: {plan_name}.</p>
          ) : (
            <p className="plan">
              You are not currently subscribed to a plan.{" "}
              <a href="subscriptions">Click here to view subscriptions.</a>
            </p>
          )}
          <p className="balance">Your current balance is: {balance} credits.</p>

          {active_subscription ? (
            //* cancel-wrapper is for the border on bottom of button
            <div className="cancel-wrapper">
              <button id="cancel-btn" onClick={this.unsubscribe}>
                Cancel Plan
              </button>
            </div>
          ) : null}
        </div>
        <div className="table-wrapper">
          <h2>Purchased Sounds</h2>
          <h2 className="sticky-message">{message}</h2>
          {downloads && downloads.length ? (
            <table>
              <thead>
                <tr>
                  <th className="th-cover">cover</th>
                  <th className="th-play"></th>
                  <th className="th-name">File Name</th>
                  <th className="th-tempo">BPM</th>
                  <th className="th-key">KEY</th>
                  <th className="th-genre">Genre</th>
                  <th className="th-type">type</th>
                  <th className="th-cost">cost</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {downloads
                  .sort((a, b) => a.pack.localeCompare(b.pack))
                  .map((sound, i) => {
                    return (
                      <tr
                        key={i}
                        className={sound.exclusive ? "exclusive" : null}
                      >
                        <td>
                          <a href={`pack#${sound.pack}`}>
                            <img
                              id="cover"
                              src={covers[sound.pack]}
                              style={{ width: "3em", height: "3em" }}
                            />
                          </a>
                        </td>
                        <td>
                          <img
                            src="../assets/play-btn.png"
                            alt="Play Button"
                            className="play-btn"
                            onClick={(evt) => this.streamSound(sound, evt)}
                          />
                        </td>
                        <td className="name-tags">
                          <p className="name">{sound.name}</p>
                          <div className="tags-instruments">
                            {sound.tags.length &&
                            typeof sound.tags === "string" ? (
                              <td className="tags meta-tag-wrapper">
                                {sound.tags
                                  .split(",")
                                  .sort((a, b) => a.localeCompare(b))
                                  .map((e, i) => (
                                    <span key={i} className="tag meta-tag">
                                      {e}
                                    </span>
                                  ))}
                              </td>
                            ) : (
                              <td></td>
                            )}
                            {sound.instrument_type.length &&
                            typeof sound.instrument_type === "string" ? (
                              <td className="instrument-type meta-tag-wrapper">
                                {sound.instrument_type
                                  .split(",")
                                  .sort((a, b) => a.localeCompare(b))
                                  .map((e, i) => (
                                    <span
                                      key={i}
                                      className="instrument meta-tag"
                                    >
                                      {e}
                                    </span>
                                  ))}
                              </td>
                            ) : (
                              <td></td>
                            )}
                          </div>
                        </td>
                        <td className="tempo">
                          {sound.tempo === 0 ? "" : sound.tempo}
                        </td>
                        <td className="key">{sound.key}</td>
                        {sound.genre.length &&
                        typeof sound.genre === "string" ? (
                          <td className="genres meta-tag-wrapper">
                            {sound.genre
                              .split(",")
                              .sort((a, b) => a.localeCompare(b))
                              .map((e, i) => (
                                <span
                                  key={i}
                                  className="genre meta-tag"
                                  // onClick={() =>
                                  //   this.toggleFilter("genre", e)
                                  // }
                                >
                                  {e}
                                </span>
                              ))}
                          </td>
                        ) : (
                          <td></td>
                        )}
                        <td className="type">{sound.type}</td>
                        <td className="cost">{sound.exclusive ? 15 : 1}</td>
                        <td>
                          <picture>
                            <source
                              srcset="../assets/download_icon-grey.webp"
                              alt="download"
                              onClick={() => this.download(sound)}
                              className="download-btn"
                              type="image/webp"
                            />
                            <img
                              src="../assets/download_icon-grey.png"
                              alt="download"
                              onClick={() => this.download(sound)}
                              className="download-btn"
                            />
                          </picture>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          ) : (
            <h3>You have not purchased any sounds.</h3>
          )}
        </div>
      </div>
    );
  }
}

const domContainer = document.querySelector("#account");
ReactDOM.render(React.createElement(Account), domContainer);

function encode(data) {
  var str = data.reduce(function (a, b) {
    return a + String.fromCharCode(b);
  }, "");
  return btoa(str).replace(/.{76}(?=.)/g, "$&\n");
}
