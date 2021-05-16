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

  get buttonTitle(): string {
    return this.isButtonDisabled ? "Stopped" : "Stop";
  }

  get isClaimButton(): boolean {
    const { data } = this.props;
    const { contractId } = window.contract;
    return contractId === data.recipient;
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        {this.isClaimButton ? (
          <Button
            className={classes.claimButton}
            disabled={false}
            autoCapitalize="none"
            variant="contained"
            color="primary"
            onClick={() => this.btnClickedHandler()}
          >
            Claim
          </Button>
        ) : (
          <Button
            className={classes.button}
            disabled={this.isButtonDisabled}
            autoCapitalize="none"
            variant="contained"
            color="primary"
            onClick={() => this.btnClickedHandler()}
          >
            {this.buttonTitle}
          </Button>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(BtnCellRenderer);
