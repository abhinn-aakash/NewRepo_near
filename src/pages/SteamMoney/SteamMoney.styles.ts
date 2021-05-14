import { createStyles, Theme } from "@material-ui/core/styles";

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "row",
      flex: 1,
      background: theme.palette.background.default,
      minHeight: "233px",
      justifyContent: "center",
      alignItems: "center",
    },
    formContainer: {
      width: "45%",
      display: "flex",
      background: theme.palette.background.paper,
      boxShadow: "3px 3px 3px #ad9f9f",
      flexDirection: "column",
      padding: "20px",
      marginRight: "20px",
    },
    resultContainer: {
      width: "45%",
      display: "flex",
      background: theme.palette.background.paper,
      boxShadow: "3px 3px 3px #ad9f9f",
      flexDirection: "column",
      padding: "20px",
      alignItems: "center",
      overflow: 'hidden'
    },
    typography: {
      width: "100%",
      textAlign: "center",
      margin: "10px",
    },
    fullRow: {
      display: "flex",
      justifyContent: "space-around",
      width: '100%'
    },
  });
