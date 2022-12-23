import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { createBrowserHistory } from "history";

// S3 - Bucket Redirection Policy for Single page web apps
const replaceHashPath = () => {
  const history = createBrowserHistory();
  const hash = history.location.hash;
  if (hash) {
    const path = hash.replace(/^#/, "");
    if (path) {
      history.replace(path);
    }
  }
};
replaceHashPath();

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.error = () => {};
  console.debug = () => {};
}
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

reportWebVitals();
