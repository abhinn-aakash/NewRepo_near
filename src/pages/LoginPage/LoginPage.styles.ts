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
  });
