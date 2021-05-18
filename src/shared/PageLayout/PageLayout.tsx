import React, { Component, ReactNode } from "react";
import {
  AppBar,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Toolbar,
  withStyles,
} from "@material-ui/core";
import { styles } from "./PageLayout.styles";
import { inject, observer } from "mobx-react";
import { AccountCircle } from "@material-ui/icons";

import { UIStore } from "../../Stores";
import { IClasses } from "../../interfaces";
import { AuthService } from "../../services";

interface Props {
  classes?: IClasses;
  uiStore?: UIStore;
  isAuthenticated: boolean;
  contractId: string;
}

interface States {
  menuTargetComponent: any;
}

@inject("uiStore")
@observer
class PageLayout extends Component<Props, States> {
  constructor(props) {
    super(props);
    this.state = {
      menuTargetComponent: null,
    };
  }

  handleMenu(event) {
    this.setState({ menuTargetComponent: event.currentTarget });
  }

  handleClose() {
    this.setState({ menuTargetComponent: null });
  }

  toggleLoader() {
    const { pageLoading } = this.props.uiStore;
    this.props.uiStore.setPageLoader(!pageLoading);
    this.handleClose();
  }

  onLogout() {
    AuthService.logout();
    this.handleClose();
  }

  // Will add computed loader from anywhere in app
  private get pageLoader(): ReactNode {
    const { classes, uiStore } = this.props;
    if (!uiStore.pageLoading) {
      return null;
    }

    return (
      <div className={classes.loader}>
        <LinearProgress />
      </div>
    );
  }

  render() {
    const { classes, isAuthenticated, contractId } = this.props;
    const { menuTargetComponent } = this.state;
    return (
      <>
        <AppBar className={classes.header} position="static">
          <Toolbar className={classes.layout}>
            <img
              className={classes.imageView}
              src="https://xeggo.co/assets/images/logo/xeggo.svg"
            ></img>
            {isAuthenticated && (
              <div className={classes.profileView}>
                <div className={classes.titleContainer}>
                  <span className={classes.title}>{contractId}</span>
                  <span className={classes.title}>total amount</span>
                </div>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={(e) => this.handleMenu(e)}
                  color="inherit"
                >
                  <AccountCircle fontSize="large" />
                </IconButton>
                <Menu
                  id="simple-menu"
                  anchorEl={menuTargetComponent}
                  keepMounted
                  open={Boolean(menuTargetComponent)}
                  onClose={(e) => this.handleClose()}
                >
                  <MenuItem className={classes.menuItem} onClick={() => this.onLogout()}>Logout</MenuItem>
                </Menu>
              </div>
            )}
          </Toolbar>
        </AppBar>

        <div className={classes.contentWrapper}>
          {this.pageLoader}
          <div className={classes.content}>{this.props.children}</div>
        </div>
      </>
    );
  }
}

export default withStyles(styles)(PageLayout);
