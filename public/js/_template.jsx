"use strict";

class Template extends React.Component {
  constructor(props) {
    const token = window.localStorage.getItem("samplehousetoken");
    super(props);
    this.state = { token };
  }

  render() {
    return (
      <div>
        <p></p>
      </div>
    );
  }
}

const domContainer = document.querySelector("#template");
ReactDOM.render(React.createElement(Template), domContainer);
