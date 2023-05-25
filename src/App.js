import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import Layout from "./Layout";
import AppRouter from "./AppRouter";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Layout>
        <div className="App">
          <AppRouter />
        </div>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
