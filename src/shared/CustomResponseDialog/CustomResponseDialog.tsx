import React, { Component } from "react";
import {
  withStyles,
  Dialog,
  Button,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  withTheme,
} from "@material-ui/core";
import { inject, observer } from "mobx-react";
import { IClasses } from "../../interfaces";
import { UIStore } from "../../stores";

interface Props {
  classes?: IClasses;
  message?: string;
  uiStore?: UIStore;
}

@inject("uiStore")
@observer
class CustomResponseDialog extends Component<Props> {
  public render() {
    const { message, uiStore } = this.props;
    return (
      <div>
        <Dialog
          open={true}
          onClose={() => uiStore.setDialogState(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Xeggo"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => uiStore.setDialogState(false)}
              color="primary"
            >
              Okay
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
export default withTheme(CustomResponseDialog);
