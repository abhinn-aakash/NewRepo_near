import { LinearProgress, withStyles } from "@material-ui/core";
import React, { Component } from "react";
import { styles } from "./GridProgress.styles";

class GridProgress extends Component<any> {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <LinearProgress
          className={classes.loader}
          variant="determinate"
          value={this.props.value}
        />
      </div>
    );
  }
}

export default withStyles(styles)(GridProgress);
