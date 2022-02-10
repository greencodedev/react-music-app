"use strict";

class Admin extends React.Component {
  constructor(props) {
    const token = window.localStorage.getItem("samplehousetoken");
    super(props);
    this.state = {
      sound: {},
      token,
      // userId: jwt_decode(token).subject,
      // user: {},
    };
  }

  async componentDidMount() {
    const { userId, token } = this.state;
    const soundId = window.location.hash.replace("#", "");

    // const user = await fetch(`localhost:5001/api/user/${userId}`, {
    //   method: "GET",
    //   type: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // }).then(async (res) => await res.json());

    const [sound] = await fetch(
      `localhost:5001/api/audio/${soundId}`,
      {
        method: "GET",
        type: "cors",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      }
    ).then(async (res) => await res.json());

    this.setState({ ...this.state, sound });
  }

  render() {
    return <div>{/* <form action="">

        </form> */}</div>;
  }
}

const domContainer = document.querySelector("#admin");
ReactDOM.render(React.createElement(Admin), domContainer);
