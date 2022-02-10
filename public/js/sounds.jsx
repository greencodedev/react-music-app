"use strict";
class Sounds extends React.Component {
  constructor(props) {
    const token = window.localStorage.getItem("samplehousetoken");
    const emptyFilterList = {
      tags: [],
      instrument_type: [],
      genre: [],
      type: [],
    };
    super(props);
    this.state = {
      limit: 25,
      offset: 0,
      page: 1,
      maxPageFetched: 1,
      maxPages: null,
      soundList: [],
      covers: {},
      tags: [],
      instruments: [],
      genre: [],
      type: ["one shot", "loop"],
      soundSourceNode: null,
      token,
      userId: jwt_decode(token).subject,
      user: {},
      userDownloads: [],
      exclusiveDownloads: [],
      extraSoundCount: 0,
      loadingSoundList: true,
      loadingSoundStream: false,
      message: "",
      filtering: false,
      tagFilters: [],
      filters: {
        tags: [],
        instrument_type: [],
        genre: [],
        type: [],
      }, //todo DRY (clone emptyFilterList)
      searchQuery: "",
    };
    this.emptyFilterList = emptyFilterList;
  }

  nextBtnHandler = () => {
    this.stopStreaming();
    window.scrollTo(0, 0);
    let {
      limit,
      offset,
      page,
      maxPageFetched,
      maxPages,
      searchQuery,
    } = this.state;

    let needToFetch = page === maxPageFetched && page <= maxPages;
    if (searchQuery) needToFetch = false;
    // console.log({ needToFetch });
    this.setState({
      ...this.state,
      offset: offset + limit,
      page: page + 1,
      maxPageFetched:
        page === maxPageFetched && needToFetch
          ? maxPageFetched + 1
          : maxPageFetched,
      loadingSoundList: needToFetch,
    });
    if (needToFetch) this.fetchSoundList(offset + limit);
  };

  prevBtnHandler = () => {
    this.stopStreaming();
    window.scrollTo(0, 0);
    const { limit, offset, page } = this.state;
    if (page > 1)
      this.setState({
        ...this.state,
        offset: offset - limit,
        page: page - 1,
      });
  };

  async fetchSoundList(offset, searchQuery) {
    const { filters } = this.state;
    let filtering = false;
    //* if any filters active, set filtering to true
    Object.values(filters).forEach((e) => {
      if (e.length && filtering === false) filtering = true;
    });
    //* filter to searching (search not filter)
    if (searchQuery === null || searchQuery) filtering = false;

    //* prevent search from non-necessary fetching (same search and empty search) prevent spamming same query search
    if (
      (searchQuery === "" && this.state.searchQuery === "") ||
      searchQuery === this.state.searchQuery
    )
      return;
    // ! LOCALHOST TESTING
    let url = new URL("localhost:5001/api/audio");
    // let url = new URL("http://localhost:5000/api/audio");
    //* set params

    url.search = new URLSearchParams({
      limit: this.state.limit,
      offset,
      tags: filtering ? filters.tags : [],
      instrument_type: filtering ? filters.instrument_type : [],
      genre: filtering ? filters.genre : [],
      type: filtering ? filters.type : [],
      searchQuery: searchQuery ? searchQuery : "",
    });

    const { status, sounds } = await fetch(url, {
      method: "GET",
      type: "cors",
      headers: {
        "Content-Type": "application/json",
        authorization: this.state.token,
      },
    }).then(async (res) => ({
      status: res.status,
      sounds: await res.json(),
    }));
    // if no sounds set message
    // console.log("fetchSoundList", { status });
    // if (status !== 200)
    //   return window.localStorage.removeItem("samplehousetoken");

    let newSoundList = [...this.state.soundList];
    //* searchQuery is null if reset filters button is clicked
    if (
      (filtering === false && this.state.filtering) ||
      searchQuery === null ||
      searchQuery
    )
      newSoundList = [];
    const { exclusiveDownloads, userDownloads } = this.state;
    // console.log("exclusive:", exclusiveDownloads, "user:", userDownloads);
    // console.log(sounds);
    sounds.forEach((e, i) => {
      /*
      //       1. sound is !exclsive
      //      OR 2. sound is exclsive AND !user downloaded another user
      //      OR 3. sound is e.exclusive AND downloaded by current user
      //      AND 4. true
      */
      //* prevent duplicate sounds (.wav and .midi files)
      if (
        !newSoundList.find((e) => e.id === i.id) /*TRUE*/ &&
        (!e.exclusive ||
          //* conditions for exclusive downloads
          (e.exclusive && !exclusiveDownloads.includes(e.id)) ||
          (e.exclusive && userDownloads.includes(e.id)))
      ) {
        newSoundList.push(e);
      }
    });
    this.setState({
      ...this.state,
      soundList: sounds.length ? (filtering ? sounds : newSoundList) : [],
      filtering,
      loadingSoundList: false,
      message: sounds.length ? "" : "No Sounds Found.",
      filters: !filtering
        ? {
            tags: [],
            instrument_type: [],
            genre: [],
            type: [],
          }
        : filters, //resetFilters
    });
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
        message: "Unable to stream sound.",
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

  async download(sound) {
    if (this.state.message !== "")
      this.setState({ ...this.state, message: "" });
    let soundName = sound.name;
    if (soundName.toLowerCase().includes("midi"))
      soundName = soundName + ".mid";
    else soundName = soundName + ".wav";
    // console.log(soundName);
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

  toggleFilter = (type, value) => {
    let filters = this.state.filters;
    if (!filters[type].includes(value)) filters[type].push(value);
    else filters[type] = filters[type].filter((e) => e !== value);
    document.getElementById("search").value = "";
    this.setState({
      ...this.state,
      filters,
      page: 1,
      offset: 0,
      searchQuery: "",
    });
    this.fetchSoundList(this.state.offset);
  };

  resetFilter = () => {
    const { filters } = this.state;
    document.getElementById("search").value = "";
    if (
      filters.tags.length ||
      filters.instrument_type.length ||
      filters.genre.length ||
      filters.type.length
    ) {
      this.setState({
        ...this.state,
        filters: {
          tags: [],
          instrument_type: [],
          genre: [],
          type: [],
        },
        page: 1,
        offset: 0,
        filtering: false,
        searchQuery: "",
        maxPageFetched: 1, //? 1
      });
    }
    this.fetchSoundList(0, null);
    //* collapse all filters in aside
    Object.keys(filters).forEach(
      (e) => (document.querySelector(`.${e}-filter`).style.display = "none")
    );
  };

  searchHandler = () => {
    const searchQuery = document.getElementById("search").value;
    this.setState({
      ...this.state,
      filters: {
        tags: [],
        instrument_type: [],
        genre: [],
        type: [],
      },
      page: 1,
      offset: 0,
      filtering: false,
      searchQuery,
    });
    this.fetchSoundList(0, searchQuery);
  };

  editHandler = (sound) => {
    // console.log({ sound });
    console.log("editHandler");
  };

  async componentDidMount() {
    const { token, limit, offset, userId } = this.state;
    const soundCount = await getSoundCount(token);
    const user = await fetch(
      `localhost:5001/api/user/${userId}`,
      {
        method: "GET",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then(async (res) => await res.json());

    const tags = await fetch(
      "localhost:5001/api/audio/category/tags",
      {
        method: "GET",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      }
    ).then(async (res) => await res.json());
    tags.sort((a, b) => a.localeCompare(b));

    const instruments = await fetch(
      "localhost:5001/api/audio/category/instrument_type",
      {
        method: "GET",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      }
    ).then(async (res) => await res.json());
    instruments.sort((a, b) => a.localeCompare(b));

    const genre = await fetch(
      "localhost:5001/api/audio/category/genre",
      {
        method: "GET",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      }
    ).then(async (res) => await res.json());
    genre.sort((a, b) => a.localeCompare(b));

    const downloads = await fetch(
      `localhost:5001/api/user/${userId}/downloads`,
      {
        method: "GET",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.state.token,
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

    window.document
      .getElementById("search")
      .addEventListener("keyup", function (e) {
        var code;
        if (e.key !== undefined) {
          code = e.key; //Enter
        } else if (e.keyIdentifier !== undefined) {
          code = e.keyIdentifier; //13
        } else if (e.keyCode !== undefined) {
          code = e.keyCode;
        }
        if (code === "Enter" || code === 13)
          document.getElementById("search-btn").click();
      });

    this.setState({
      ...this.state,
      maxPages: Math.ceil(soundCount / limit),
      user,
      tags,
      instruments,
      genre,
      userDownloads,
      exclusiveDownloads,
    });
    this.fetchSoundList(offset);
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
  }

  render() {
    let {
      soundList,
      covers,
      page,
      maxPages,
      offset,
      limit,
      loadingSoundList,
      message,
      user,
      tags,
      instruments,
      genre,
      type,
      filters,
      filtering,
      searchQuery,
      userDownloads,
    } = this.state;

    if (filtering || searchQuery) {
      maxPages = Math.ceil(soundList.length / limit);
    }

    //! fetch covers here
    const packList = [];
    soundList
      .sort((a, b) => a.pack.localeCompare(b.pack))
      .slice(offset, offset + limit)
      .forEach((e) => {
        if (!packList.includes(e.pack)) {
          packList.push(e.pack);
          this.fetchCover(e.pack);
        }
      });

    // console.log(this.state);

    return (
      <div className="home-wrapper">
        <div className="search-wrapper">
          <h1>SOUNDS</h1>
          <div className="search-bar">
            <input
              id="search"
              type="text"
              name="search"
              placeholder="Search Sounds..."
            />
            <button id="search-btn" onClick={this.searchHandler}>
              Search
            </button>
          </div>
          {/* <div className="credit-offers">
            <a href="offers">Offers</a> */}
          <h3 className="credits">{user.balance} credits</h3>
          {/* </div> */}
        </div>

        <div className="sound-wrapper">
          <aside>
            <h2>Filters</h2>
            <h3 onClick={() => toggleFilterMenu("tags")}>Tags</h3>
            <ul className="filter tags-filter">
              {tags.map((e, i) => (
                <h6
                  key={i}
                  onClick={() => this.toggleFilter("tags", e)}
                  className={filters["tags"].includes(e) ? "selected" : ""}
                >
                  {e}
                </h6>
              ))}
            </ul>
            <h3 onClick={() => toggleFilterMenu("instrument_type")}>
              Instruments
            </h3>
            <ul className="filter instrument_type-filter">
              {instruments.map((e, i) => (
                <h6
                  key={i}
                  onClick={() => this.toggleFilter("instrument_type", e)}
                  className={
                    filters["instrument_type"].includes(e) ? "selected" : ""
                  }
                >
                  {e}
                </h6>
              ))}
            </ul>
            <h3 onClick={() => toggleFilterMenu("genre")}>Genres</h3>
            <ul className="filter genre-filter">
              {genre.map((e, i) => (
                <h6
                  key={i}
                  onClick={() => this.toggleFilter("genre", e)}
                  className={filters["genre"].includes(e) ? "selected" : ""}
                >
                  {e}
                </h6>
              ))}
            </ul>
            <h3 onClick={() => toggleFilterMenu("type")}>Type</h3>
            <ul className="filter type-filter">
              {type.map((e, i) => (
                <h6
                  key={i}
                  onClick={() => this.toggleFilter("type", e)}
                  className={filters["type"].includes(e) ? "selected" : ""}
                >
                  {e}
                </h6>
              ))}
            </ul>
            <button onClick={() => this.resetFilter()} className="reset-filter">
              reset filters
            </button>
            <p
              style={{
                color: "salmon",
                textAlign: "left",
                fontWeight: "700",
                textShadow: "1px 1px 1px black",
              }}
            >
              Exclusive Sounds:
              <br />
              15 credits
            </p>
          </aside>
          <div className="sound-wrapper-inner">
            {loadingSoundList ? <div className="load-spinner" /> : null}
            {message ? <h2 className="sticky-message">{message}</h2> : null}
            {soundList.length ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th className="th-cover">cover</th>
                      <th className="th-play"></th>
                      <th className="th-name">File Name</th>
                      <th className="th-tempo">BPM</th>
                      <th className="th-key">KEY</th>
                      {/* <th className="th-instrument">instrument type</th> */}
                      <th className="th-genre">Genre</th>
                      <th className="th-type">type</th>
                      <th className="th-cost">cost</th>
                      <th></th>
                      {/* <th></th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {soundList
                      .sort((a, b) => a.pack.localeCompare(b.pack))
                      .slice(offset, offset + limit)
                      .map((sound, i) => {
                        return (
                          <tr
                            key={i}
                            className={sound.exclusive ? "exclusive" : null}
                          >
                            <td>
                              <a href={`pack#${sound.pack}`}>
                                <img id="cover" src={covers[sound.pack]} />
                              </a>
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
                                        <span
                                          key={i}
                                          className="tag meta-tag"
                                          onClick={() =>
                                            this.toggleFilter("tags", e)
                                          }
                                        >
                                          {e}
                                        </span>
                                      ))}
                                  </td>
                                ) : (
                                  <td></td>
                                )}
                                {sound.instrument_type.length &&
                                typeof sound.instrument_type === "string" ? (
                                  <td className="meta-tag-wrapper">
                                    {sound.instrument_type
                                      .split(",")
                                      .sort((a, b) => a.localeCompare(b))
                                      .map((e, i) => (
                                        <span
                                          key={i}
                                          className="meta-tag"
                                          onClick={() =>
                                            this.toggleFilter(
                                              "instrument_type",
                                              e
                                            )
                                          }
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
                                    <span
                                      key={i}
                                      className="instrument meta-tag"
                                      onClick={() =>
                                        this.toggleFilter("instrument_type", e)
                                      }
                                    >
                                      {e}
                                    </span>
                                  ))}
                              </td>
                            ) : (
                              <td></td>
                            )}{" "} */}

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
                                      onClick={() =>
                                        this.toggleFilter("genre", e)
                                      }
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
                              {userDownloads.includes(sound.id) ? (
                                <span className="user-downloaded">
                                  &#10004;
                                </span>
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
                <div className="pagination">
                  <button
                    onClick={page > 1 ? this.prevBtnHandler : null}
                    style={{ color: page === 1 ? "grey" : "red" }}
                  >
                    Back
                  </button>
                  {page}
                  <button
                    onClick={
                      page === maxPages || loadingSoundList
                        ? null
                        : this.nextBtnHandler
                    }
                    style={{
                      color: page === maxPages ? "grey" : "red",
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

const domContainer = document.querySelector("#sounds");
ReactDOM.render(React.createElement(Sounds), domContainer);

function encode(data) {
  var str = data.reduce(function (a, b) {
    return a + String.fromCharCode(b);
  }, "");
  return btoa(str).replace(/.{76}(?=.)/g, "$&\n");
}

async function getSoundCount(token) {
  return await fetch(`localhost:5001/api/audio/count`, {
    method: "GET",
    type: "cors",
    headers: {
      "Content-Type": "application/octet-stream",
      authorization: token,
    },
  }).then(async (res) => await res.json());
}

function toggleFilterMenu(filterType) {
  const selectedMenu = document.querySelector(`.${filterType}-filter`).style;
  if (selectedMenu.display === "block") selectedMenu.display = "none";
  else selectedMenu.display = "block";
}
