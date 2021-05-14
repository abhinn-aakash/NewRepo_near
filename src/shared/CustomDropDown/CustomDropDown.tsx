import React, { Component } from "react";

import { styles } from "./CustomDropDown.styles";
import { MenuItem, Select, Typography, withStyles } from "@material-ui/core";
import { IClasses, IDropDownOption } from "../../interfaces";

type Props = {
  title: string;
  classes?: IClasses;
  value: string;
  options: IDropDownOption[];
  onChange: (value: string) => any;
};

class CustomDropDown extends Component<Props> {
  render() {
    const { classes, value, onChange, title, options } = this.props;
    return (
      <>
        <Typography variant="h6">{title}</Typography>
        <Select
          labelId="demo-simple-select-filled-label"
          id="demo-simple-select-filled"
          variant="outlined"
          value={value}
          onChange={(e) => onChange(e.target.value as string)}
        >
          <MenuItem key="none" value="">
            <em>None</em>
          </MenuItem>
          {options.map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </>
    );
  }
}

export default withStyles(styles)(CustomDropDown);
