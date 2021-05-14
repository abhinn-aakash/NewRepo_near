import { createStyles, Theme } from "@material-ui/core/styles";

export const styles = (theme: Theme) =>
  createStyles({
    container: {
      height: "100%",
      display: "flex",
    },
    loader: {
      display: "flex",
      flex: 1,
      alignSelf: 'center',
    },
  });
