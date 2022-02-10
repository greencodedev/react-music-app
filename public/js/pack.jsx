"use strict";

class Pack extends React.Component {
  constructor(props) {
    const token = window.localStorage.getItem("samplehousetoken");
    super(props);
    this.state = {
      token,
      userId: jwt_decode(token).subject,
      pack: {},
      loading: true,
      message: "",
      userDownloads: [],
      exclusiveDownloads: [],
    };
  }

  async streamSound(sound, evt) {
    this.stopStreaming();
    const loadingSpinner = evt.target.classList;
    loadingSpinner.add("stream-spinner");

    //* make copy of sound to not overwrite .mid w/ .wav
    let soundName = sound.name + ".wav";
    if (soundName.includes(".mid")) soundName = soundName.replace(".mid", "");

    const data = await fetch(
      `localhost:5001/api/audio/stream/${encodeURIComponent(
        // `http://localhost:5000/api/audio/stream/${encodeURIComponent(
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
        // `http://localhost:5000/api/audio/download/${encodeURIComponent(
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
        userDownloads: [...this.state.userDownloads, sound.id],
      });
    } //* Already Downloaded
    else if (res.status === 226)
      this.setState({
        ...this.state,
        message: "Already purchased. Downloading...",
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
      return this.setState({ ...this.state, message: "" });
    }, 3000);
  }

  async componentDidMount() {
    const packName = window.location.hash.replace("#", "");
    const { token } = this.state;
    let pack = await fetch(
      `localhost:5001/api/audio/pack/${packName}`,
      {
        method: "GET",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      }
    ).then(async (res) => {
      if (res.status === 500)
        return this.setState({ ...this.state, loading: false, error: true });
      return await res.json();
    });

    const downloads = await fetch(
      `localhost:5001/api/user/${this.state.userId}/downloads`,
      {
        method: "GET",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    ).then(async (res) => await res.json());
    const userDownloads = [];
    downloads.forEach((e) => (e ? userDownloads.push(e["id"]) : null));

    const exclusiveDownloads = await fetch(
      "localhost:5001/api/audio/exclusiveDownloads",
      {
        method: "GET",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      }
    ).then(async (res) => await res.json());

    const soundList = [];
    pack.sounds.forEach((e, i) => {
      //* prevent duplicate sounds (.wav and .midi files)
      if (
        !soundList.find((e) => e.id === i.id) /*TRUE*/ &&
        (!e.exclusive ||
          //* conditions for exclusive downloads
          (e.exclusive && !exclusiveDownloads.includes(e.id)) ||
          (e.exclusive && userDownloads.includes(e.id)))
      ) {
        soundList.push(e);
      }
    });
    pack.sounds = soundList;

    const cover = await fetch(
      `localhost:5001/api/audio/cover/${packName}`,
      {
        method: "GET",
        type: "cors",
        headers: {
          "Content-Type": "image/png",
          authorization: token,
        },
      }
    ).then(async (res) => await res.json());
    const url = "data:image/png;base64," + encode(cover.data);
    pack.url = url;
    this.setState({
      ...this.state,
      pack,
      loading: false,
      error: !pack.sounds.length, //if pack exists, but there is an error getting sounds
      userDownloads,
      exclusiveDownloads,
    });
  }

  render() {
    let {
      url,
      artist,
      description,
      sounds,
      title,
      sound_tags,
    } = this.state.pack;
    const { userDownloads } = this.state;

    if (this.state.error)
      return (
        <div className="pack-wrapper">
          <p className="error">
            There was an error loading this pack.{" "}
            <span onClick={() => history.back()}>Click here to go back.</span>
          </p>
        </div>
      );

    return (
      <div className="pack-wrapper">
        {this.state.message ? (
          <h2 className="sticky-message">{this.state.message}</h2>
        ) : null}
        {this.state.loading ? (
          <div className="load-spinner" />
        ) : (
          <div>
            <div className="pack-info">
              <img src={url} />
              <div className="pack-data">
                <h1>{title}</h1>
                <div className="artist-tags">
                  <p>{artist}</p>
                  <div className="tags">
                    {sound_tags
                      .split(",")
                      .sort((a, b) => a.localeCompare(b))
                      .map((e, i) => (
                        <span key={i}>{e}</span>
                      ))}
                  </div>
                </div>
                <p className="description">{description}</p>
              </div>
            </div>
            <div className="table-wrapper">
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
                  {sounds
                    .sort((a, b) => a.pack.localeCompare(b.pack))
                    .map((sound, i) => {
                      return (
                        <tr
                          key={i}
                          className={sound.exclusive ? "exclusive" : null}
                        >
                          <td>
                            <img
                              id="cover"
                              src={url}
                              style={{
                                width: "3em",
                                height: "3em",
                                cursor: "inherit",
                              }}
                            />
                          </td>
                          <td>
                            <img
                              src="../assets/play-btn.png"
                              alt="Play"
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
                          {/* {sound.instrument_type.length &&
                          typeof sound.instrument_type === "string" ? (
                            <td className="instrument-type meta-tag-wrapper">
                              {sound.instrument_type
                                .split(",")
                                .sort((a, b) => a.localeCompare(b))
                                .map((e, i) => (
                                  <span key={i} className="instrument meta-tag">
                                    {e}
                                  </span>
                                ))}
                            </td>
                          ) : (
                            <td></td>
                          )} */}
                          {sound.genre.length &&
                          typeof sound.genre === "string" ? (
                            <td className="genres meta-tag-wrapper">
                              {sound.genre
                                .split(",")
                                .sort((a, b) => a.localeCompare(b))
                                .map((e, i) => (
                                  <span key={i} className="genre meta-tag">
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
                            {userDownloads.includes(sound.id) ? (
                              <span className="user-downloaded">&#10004;</span>
                            ) : (
                              <picture>
                                <source
                                  srcset="../assets/download-icon.webp"
                                  alt="download"
                                  onClick={() => this.download(sound)}
                                  className="download-btn"
                                  type="image/webp"
                                />
                                <img
                                  src="../assets/download-icon.png"
                                  alt="download"
                                  onClick={() => this.download(sound)}
                                  className="download-btn"
                                />
                              </picture>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const domContainer = document.querySelector("#pack");
ReactDOM.render(React.createElement(Pack), domContainer);

function encode(data) {
  var str = data.reduce(function (a, b) {
    return a + String.fromCharCode(b);
  }, "");
  return btoa(str).replace(/.{76}(?=.)/g, "$&\n");
}
