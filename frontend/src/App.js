import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css"


function App() {

  return (
    <>
       <h1 className="text-3xl font-bold underline text-center">
    Hello world! ihdsudgweg
  </h1>
    </>
  );
}

export default function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}
  