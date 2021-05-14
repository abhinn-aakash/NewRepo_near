import React, { Component } from "react";
import { Button, Typography, withStyles } from "@material-ui/core";
import { styles } from "./Dashboard.styles";
import { IClasses } from "../../interfaces";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { DataStore } from "../../stores";
import { inject, observer } from "mobx-react";

interface Props extends RouteComponentProps {
  classes?: IClasses;
  dataStore?: DataStore;
}

@inject("dataStore")
@observer
class Dashboard extends Component<Props> {
  render() {
    const { classes, dataStore } = this.props;
    const { totalEarnings, totalSpent, totalAmount } = dataStore;

    return (
      <>
        <div className={classes.root}>
          <div className={classes.amountContainer}>
            <Typography variant="h4">{totalAmount}</Typography>
          </div>
          <div className={classes.details}>
            <Typography variant="h5">
              Total Amount Received {totalEarnings}
            </Typography>
            <Typography variant="h5">Total Amount Sent {totalSpent}</Typography>
          </div>
          <div className={classes.buttonContainer}>
            <Button variant="contained" color="primary">
              <Link className={classes.link} to="/ladger">
                Ledger
              </Link>
            </Button>
            <Button variant="contained" color="primary">
              <Link className={classes.link} to="/stream-form">
                Stream Money
              </Link>
            </Button>
          </div>
        </div>
      </>
    );
  }
}

export default withStyles(styles)(Dashboard);
