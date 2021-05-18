import { createStyles, Theme } from "@material-ui/core/styles";

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "row",
      flex: 1,
      background: theme.palette.background.default,
      justifyContent: "center",
      alignItems: "center",
      "@media (max-width: 600px)": {
        flexDirection: "column",
        paddingTop: 40,
      },
    },
    formContainer: {
      width: "45%",
      display: "flex",
      background: theme.palette.background.paper,
      boxShadow: "3px 3px 3px #ad9f9f",
      flexDirection: "column",
      padding: "20px",
      marginRight: "20px",
      
      "@media (max-width: 600px)": {
        width: "100%",
        marginRight: "0px",
        marginBottom: "0px",
      },
    },
    resultContainer: {
      width: "45%",
      display: "flex",
      background: theme.palette.background.paper,
      boxShadow: "3px 3px 3px #ad9f9f",
      flexDirection: "column",
      padding: "20px",
      alignItems: "center",
      overflow: "hidden",
      "@media (max-width: 600px)": {
        width: "100%",
        marginRight: "0px",
        overflow: "scroll",
        paddingBottom: "40px",
      },
    },
    typography: {
      width: "100%",
      textAlign: "center",
      margin: "10px",
    },
    fullRow: {
      display: "flex",
      justifyContent: "space-around",
      width: "100%",
    },
    button: {
      display: "flex",
      justifyContent: "center",
      width: "65%",
    },
  });
