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
    input: {
      minHeight: 50,
      borderRadius: 6,
      paddingLeft: 20,
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
    menuItem: {
      fontFamily: '"Ubuntu", sans-serif',
      fontSize: 14,
      color: theme.palette.primary.main,
    },
    selectContent: {
      boxShadow: `2px 2px 2px #ad9f9f`,
      fontFamily: '"Ubuntu", sans-serif',
      fontSize: '1.25rem',
      color: theme.palette.primary.main,
    },
  });
