import { createStyles, Theme } from "@material-ui/core/styles";

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      height: "100%",
      display: "flex",
    },
    button: {
      display: "flex",
      flex: 1,
      alignSelf: "center",
      maxHeight: "30px",
      maxWidth: "60px",
      backgroundColor: "red",
    },
    claimButton: {
      display: "flex",
      flex: 1,
      alignSelf: "center",
      maxHeight: "30px",
      maxWidth: "60px",
      backgroundColor: "green",
    },
  });
