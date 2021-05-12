import { createStyles, Theme } from "@material-ui/core/styles";

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      background: theme.palette.background.default,
      minHeight: "233px",
      justifyContent: "center",
      alignItems: "center",
    },
    amountContainer: {
      height: "200px",
      width: "200px",
      justifyContent: "center",
      alignItems: "center",
      display: "flex",
      borderRadius: "100px",
      background: "white",
      boxShadow: `3px 3px 3px #ad9f9f`,
    },
    details: {
      width: "100%",
      display: "flex",
      justifyContent: "space-around",
      marginTop: "50px",
    },
    buttonContainer: {
      width: "100%",
      display: "flex",
      justifyContent: "space-around",
      marginTop: "50px",
    },
    link: {
      color: "#ffffff",
      textDecoration: "none",
      cursor: "pointer",
    },
  });
