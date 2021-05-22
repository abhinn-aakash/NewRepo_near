import React, { Component } from "react";
import {
  Button,
  withStyles,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import { styles } from "./LoginPage.styles";
import { IClasses } from "../../interfaces";
import { RouteComponentProps } from "react-router";

interface Props extends RouteComponentProps {
  classes?: IClasses;
  login?: () => void;
}

interface States {
  menuTargetComponent: any;
}

class LoginPage extends Component<Props, States> {
  constructor(props) {
    super(props);
    this.state = {
      menuTargetComponent: null,
    };
  }

  handleOpen(event) {
    this.setState({ menuTargetComponent: event.currentTarget });
  }

  handleClose() {
    this.setState({ menuTargetComponent: null });
  }

  render() {
    const { classes, login } = this.props;
    const { menuTargetComponent } = this.state;
    return (
      <>
        <div className={classes.root}>
          <Button
            variant="contained"
            color="primary"
            onClick={(e) => this.handleOpen(e)}
          >
            Login
          </Button>
          <Dialog
            onClose={(e) => this.handleClose()}
            aria-labelledby="simple-dialog-title"
            open={Boolean(menuTargetComponent)}
          >
            <DialogTitle id="simple-dialog-title">Login with Xeggo</DialogTitle>
            <List>
              <ListItem autoFocus button onClick={() => login()}>
                <ListItemText className={classes.listItem} primary="Near" />
              </ListItem>
              <ListItem autoFocus button onClick={(e) => this.handleClose()}>
                <ListItemText className={classes.listItem} primary="Celo" />
              </ListItem>
              <ListItem autoFocus button onClick={(e) => this.handleClose()}>
                <ListItemText className={classes.listItem} primary="Ethereum" />
              </ListItem>
            </List>
          </Dialog>
        </div>
      </>
    );
  }
}

export default withStyles(styles)(LoginPage);
