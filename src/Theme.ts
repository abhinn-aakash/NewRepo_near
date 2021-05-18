import { ThemeOptions } from "@material-ui/core";

const Theme: ThemeOptions = {
  typography: {
    fontFamily: '"Ubuntu", sans-serif',
    fontSize: 14,
  },
  palette: {
    common: {},
    primary: {
      main: "#005295",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#5fa30a",
      contrastText: "#ffffff",
    },
    error: {
      main: "#f20000",
      contrastText: "#ffffff",
    },
    text: {
      primary: "#ffffff",
      secondary: "#929292",
      hint: "#CD263C",
    },
    divider: "#cbcdd5",
    background: {
      default: "#eeefef",
      paper: "#ffffff",
    },
    action: {
      active: "#c9c9c9",
      hover: "#d9d9d9",
      selected: "#c9c9c9",
    },
  },
  
};

export default Theme;
