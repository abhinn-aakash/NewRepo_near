import { createStyles, Theme } from "@material-ui/core/styles";

export const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      background: theme.palette.background.default,
      justifyContent: "center",
      alignItems: "center",
      "@media (max-width: 600px)": {
        justifyContent: "space-around",
        paddingTop: 40,
      },
    },
    amountContainer: {
      minWidth: "10vw",
      minHeight: "10vw",

      justifyContent: "center",
      alignItems: "center",
      display: "flex",
      borderRadius: "50%",
      background: "white",
      boxShadow: `3px 3px 3px #ad9f9f`,

      "@media (max-width: 600px)": {
        minWidth: "150px",
        minHeight: "150px",
      },
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
      fontFamily: "Ubuntu, sans-serif",
    },
    button: {
      minWidth: "200px",
    },
  });
