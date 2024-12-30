import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatProvider from "./Context/ChatProvider.js";
import HomePage from "./Pages/HomePage.js";
import ChatPage from "./Pages/ChatPage.js";
import ErrorPage from "./Pages/ErrorPage.js";
import "./App.css";

const App = () => {
  return (
    <>
      <div className="App">
        <Router>
          <ChatProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </ChatProvider>
        </Router>
      </div>
    </>
  );
};
export default App;
