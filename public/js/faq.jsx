"use strict";

class Faq extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [
        {
          question: "What is royalty free?",
          answer:
            "Royalty free means a licensee can use a work without owning the copyright or paying royalties on a per use basis.",
        },
        {
          question: "Are Sample.House’s loops & sounds royalty free?",
          answer:
            "Yes. All of our samples are royalty-free & do not require royalty payments for commercial use.",
        },
        {
          question: "What are “Exclusive Loops” on Sample.House?",
          answer:
            "Exclusive loops are available for one download, one user. This means that once the loops is downloaded, it is removed from the website and cannot be downloaded by anyone else ever again.",
        },
        {
          question:
            "What if I do not use all of my monthly credits, will they expire?",
          answer:
            "No. Your unused monthly credits will roll over into the following month.",
        },
        {
          question: "Is my subscription auto-renewed?",
          answer:
            "Yes, by default. If you do not want auto-renewal for your subscription, you can adjust the settings to reflect a manual monthly renewal that is manually paid for by the user each month.",
        },
      ],
    };
  }

  render() {
    return (
      <div>
        <h2>FAQ's</h2>
        {this.state.data.map((e, i) => (
          <div key={i}>
            <h3
              className="question"
              onClick={({ target }) => toggleAnswer(target)}
            >
              Q: {e.question}
            </h3>
            <p className="answer hide">
              <span>A:</span> {e.answer}
            </p>
          </div>
        ))}
      </div>
    );
  }
}

const domContainer = document.querySelector("#faq");
ReactDOM.render(React.createElement(Faq), domContainer);

function toggleAnswer(q) {
  const a = q.nextElementSibling;
  q.classList.toggle("active");
  a.classList.toggle("hide");
  if (a.style.maxHeight) a.style.maxHeight = null;
  else a.style.maxHeight = a.scrollHeight + "px";
}
