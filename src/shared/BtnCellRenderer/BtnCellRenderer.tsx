import { Button, withStyles } from "@material-ui/core";
import React, { Component } from "react";
import { IClasses } from "../../interfaces";
import { StreamedDataModel } from "../../models";
import { styles } from "./BtnCellRenderer.styles";

interface Props {
  clicked: Function;
  data: StreamedDataModel;
  classes?: IClasses;
}

class BtnCellRenderer extends Component<Props> {
  constructor(props) {
    super(props);
    this.btnClickedHandler = this.btnClickedHandler.bind(this);
  }

  btnClickedHandler() {
    this.props.clicked(this.props.data.streamId);
  }

  get isButtonDisabled(): boolean {
    const { data } = this.props;
    return !data.isEntity;
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <Button
          className={classes.button}
          disabled={this.isButtonDisabled}
          variant="contained"
          color="primary"
          onClick={() => this.btnClickedHandler()}
        >
          Stop
        </Button>
      </div>
    );
  }
}

export default withStyles(styles)(BtnCellRenderer);
