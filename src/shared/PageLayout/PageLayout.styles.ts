import { createStyles, Theme } from "@material-ui/core/styles";

export const styles = (theme: Theme) =>
  createStyles({
    layout: {
      display: "flex",
      flexDirection: "row",
      overflow: "hidden",
      justifyContent: "space-between",
    },
    header: {
      maxHeight: "80px",
    },
    imageView: {
      maxWidth: 100,
    },
    link: {
      color: theme.palette.text.primary,
    },
    contentWrapper: {
      display: "flex",
      width: "100%",
      height: "calc(100% - 70px)", // minus header height
      position: "fixed",
    },
    content: {
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      height: "100%",
      overflowY: "auto",
      padding: "10px 25px 10px 25px",
    },
    loader: {
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
    },
  });
