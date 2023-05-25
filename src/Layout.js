import React from "react";
import { AppBar, Toolbar, Typography, Container } from "@mui/material";

const Layout = ({ children }) => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            Financial Application
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md">{children}</Container>
    </>
  );
};

export default Layout;
