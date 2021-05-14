import React, { Component } from "react";
import { Button, Typography, withStyles } from "@material-ui/core";
import { RouteComponentProps } from "react-router";

import { IClasses, IDropDownOption } from "../../interfaces";
import { FormInputControl } from "../../shared";
import { styles } from "./SteamMoney.styles";
import { StremeFormModel } from "../../models";
import CustomDropDown from "../../shared/CustomDropDown/CustomDropDown";
import { inject, observer } from "mobx-react";
import { UIStore } from "../../stores";

interface State {
  formData: StremeFormModel;
}

interface Props extends RouteComponentProps {
  updateMethod: Function;
  classes?: IClasses;
  uiStore?: UIStore;
}

@inject("uiStore")
@observer
class SteamMoney extends Component<Props, State> {
  private readonly tokenType: IDropDownOption[] = [
    {
      value: "n1",
      label: "Near",
    },
  ];

  private readonly possibleFrequency: IDropDownOption[] = [
    {
      value: "1",
      label: "Second",
    },
    {
      value: "2",
      label: "Minute",
    },
    {
      value: "3",
      label: "Daily",
    },
    {
      value: "4",
      label: "Week",
    },
    {
      value: "5",
      label: "Month",
    },
  ];

  constructor(props) {
    super(props);
    this.state = {
      formData: new StremeFormModel(),
    };
  }

  private onInputChange(id: string, value: string | number): void {
    this.setState((prevState) => {
      return {
        ...prevState,
        formData: {
          ...prevState.formData,
          [id]: value,
        },
      };
    });
  }

  get tokenAmount(): string {
    const { tokenType, amount } = this.state.formData;
    const tName =
      this.tokenType.find((a) => a.value === tokenType)?.label || "";
    if (Number(amount) > 0 && tName.length) {
      return (
        `${amount} ${
          this.tokenType.find((a) => a.value === tokenType)?.label
        }` || "0"
      );
    }
    return "0";
  }

  submitForm() {
    const { uiStore, updateMethod } = this.props;
    const { formData } = this.state;
    const {
      amount,
      receiverAddress,
      frequency,
      stopDate,
      startDate,
      tokenType,
    } = formData;

    const data = {
      recipient: receiverAddress,
      deposit: Number(amount),
      frequency: Number(frequency),
      startTime: Number(startDate),
      stopTime: Number(stopDate),
    };
    uiStore.setPageLoader(true);
    window.contract
      .createStream(data)
      .then((a) => {
        alert("Streaming started");
        this.setState((prevState) => {
          return {
            ...prevState,
            formData: new StremeFormModel(),
          };
        });
      })
      .catch((err) => {
        alert(err);
      })
      .finally(() => {
        updateMethod();
        uiStore.setPageLoader(false);
      });
  }

  render() {
    const { classes } = this.props;
    const {
      tokenType,
      receiverAddress,
      amount,
      frequency,
      startDate,
      stopDate,
    } = this.state.formData;
    return (
      <div className={classes.root}>
        <div className={classes.formContainer}>
          <CustomDropDown
            key="tokenField"
            title="Token type"
            options={this.tokenType}
            value={tokenType}
            onChange={(value) => this.onInputChange("tokenType", value)}
          />
          <FormInputControl
            key="receiverField"
            title="Receiver Address"
            value={receiverAddress}
            onChange={(value) => this.onInputChange("receiverAddress", value)}
          />
          <FormInputControl
            key="amountField"
            title="Amount"
            value={amount}
            onChange={(value) => this.onInputChange("amount", value)}
          />
          <CustomDropDown
            key="frequencyField"
            title="Frequency"
            options={this.possibleFrequency}
            value={frequency}
            onChange={(value) => this.onInputChange("frequency", value)}
          />
          <FormInputControl
            key="startTimeField"
            title="Start time"
            value={startDate}
            type="date"
            onChange={(value) => this.onInputChange("startDate", value)}
          />
          <FormInputControl
            key="stopTimeField"
            title="Stop time"
            value={stopDate}
            type="date"
            onChange={(value) => this.onInputChange("stopDate", value)}
          />
        </div>
        <div className={classes.resultContainer}>
          <Typography className={classes.typography} variant="h6">
            You are depositing
          </Typography>
          <Typography color="primary" variant="h3">
            {this.tokenAmount}
          </Typography>
          <div className={classes.fullRow}>
            <Typography className={classes.typography} variant="h6">
              Duration:
            </Typography>
            <Typography className={classes.typography} variant="h6">
              7 days
            </Typography>
          </div>
          <div className={classes.fullRow}>
            <Typography className={classes.typography} variant="h6">
              Our fees:
            </Typography>
            <Typography className={classes.typography} variant="h6">
              0
            </Typography>
          </div>
          <Button
            className={classes.fullRow}
            variant="contained"
            color="primary"
            onClick={() => this.submitForm()}
          >
            Stream Money
          </Button>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(SteamMoney);
