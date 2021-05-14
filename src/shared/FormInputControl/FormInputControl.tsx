import React, { Component } from "react";
import { observer } from "mobx-react";
import { styles } from "./FormInputControl.style";
import { TextField, Typography, withStyles } from "@material-ui/core";
import { IClasses } from "../../interfaces";
import moment from "moment";

type Props = {
  title: string;
  value: string | number;
  onChange: (value: string | number) => any;
  type?: string;
  key?: string;
  classes?: IClasses;
};

class FormInputControl extends Component<Props> {
  private get isDate(): boolean {
    const { type } = this.props;
    return type === "date";
  }

  private get value(): string {
    const { value, title } = this.props;
    return this.isDate
      ? moment(value).format("YYYY-MM-DD").toString()
      : (value as string);
  }

  private onInputChange(e): void {
    const { onChange } = this.props;
    const value: number | string = this.isDate
      ? Number(moment(e.target.value).format("x"))
      : e.target.value;
    onChange(value);
  }

  render() {
    const { key, classes, title, type = "text" } = this.props;
    return (
      <>
        <Typography variant="h6">{title}</Typography>
        <TextField
          key={key}
          id="outlined-basic"
          variant="outlined"
          type={type}
          value={this.value}
          onChange={(e) => this.onInputChange(e)}
        />
      </>
    );
  }
}

export default withStyles(styles)(FormInputControl);
