import React from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { VSCodeProvider } from "./context/VSCodeContext";
import ChatContainer from "./components/ChatContainer";

function App() {
  return (
    <VSCodeProvider>
      <ThemeProvider>
        <ChatContainer />
      </ThemeProvider>
    </VSCodeProvider>
  );
}

export default App;
