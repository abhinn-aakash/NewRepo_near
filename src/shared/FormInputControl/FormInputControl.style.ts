import { createStyles, Theme } from "@material-ui/core/styles";

export const styles = (theme: Theme) =>
  createStyles({
    item: {
      borderWidth: 1,
      borderRadius: 4,
    },
    label: {
      fontSize: 16,

      marginBottom: 8,
    },
    error: {
      color: "red",
      marginTop: 10,
      fontSize: 16,
    },
    hint: {
      marginTop: 10,
      color: "gray",
    },
    inputContent: {
      boxShadow: `2px 2px 2px #ad9f9f`,
    },
    input: {
      fontFamily: '"Ubuntu", sans-serif',
      fontSize: "1.25rem",
      color: theme.palette.primary.main,
    },
  });
