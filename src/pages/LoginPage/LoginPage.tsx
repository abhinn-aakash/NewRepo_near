import React, { Component } from "react";
import { Button, withStyles } from "@material-ui/core";
import { styles } from "./LoginPage.styles";
import { IClasses } from "../../interfaces";
import { RouteComponentProps } from "react-router";

interface Props extends RouteComponentProps {
  classes?: IClasses;
  login?: () => void;
}

class LoginPage extends Component<Props> {
  render() {
    const { classes, login } = this.props;
    return (
      <>
        <div className={classes.root}>
          <Button variant="contained" color="primary" onClick={() => login()}>
            Login
          </Button>
        </div>
      </>
    );
  }
}

export default withStyles(styles)(LoginPage);
