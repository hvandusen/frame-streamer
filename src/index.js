import App from "./js/components/App.jsx";
import React from "react";
import ReactDOM from "react-dom";
import  "./style.scss"
const wrapper = document.getElementById("container");
wrapper ? ReactDOM.render(<App/>, wrapper) : false;
