import { createStyles, Theme } from "@material-ui/core/styles";

export const styles = ({ palette }: Theme) =>
  createStyles({
    gridContainer: {
      height: "100%",
      width: "100%",
      "& div.ag-root-wrapper": {
        border: "none",
      },
      "& div.ag-header": {
        borderBottom: "none",
        background: palette.primary.main,
        fontSize: "12px",
        lineHeight: "19px",
      },
      "& div.ag-header-row": {
        color: palette.primary.contrastText,
        background: palette.primary.main,
      },
      "& span.ag-header-icon": {
        color: palette.primary.contrastText,
      },
      "& div.ag-row": {
        color: palette.text.primary,
        background: palette.background.paper,
        fontSize: "13px",
        cursor: "pointer",
        borderColor: palette.divider,
      },
      "& div.ag-row-editing": {
        cursor: "default",

        "& .ag-cell:focus:not(.ag-cell-range-selected)": {
          borderColor: "transparent",
        },
      },
      "& div.ag-row-editing.ag-row-hover": {
        background: palette.background.paper,
      },
      "& div.ag-row-odd": {
        background: palette.background.paper,
        color: palette.text.primary,
      },
      "& div.ag-cell": {
        display: "flex",
        alignItems: "center",
      },
      "& div.ag-row-hover": {
        background: palette.grey["200"],
      },
      "& div.ag-row-selected": {
        background: palette.grey["200"],
      },
      "& div.ag-paging-panel": {
        background: palette.background.paper,
        color: palette.text.primary,
      },
      "& div .ag-cell-inline-editing": {
        lineHeight: "unset",
        background: palette.background.paper,
        height: "100%",
      },
      "& .ag-body-viewport": {
        background: palette.background.paper,
      },
      "& .ag-overlay-no-rows-center": {
        color: palette.text.primary,
      },
      "& .ag-react-container": {
        height: "100%",
        width: "100%",
      },
    },
    serverPagination: {
      height: "85%",
    },
    pagination: {
      background: palette.background.paper,
    },
    rowEditing: {
      "& .ag-body-viewport": {
        overflow: "hidden",
      },
      "& .ag-header-viewport": {
        pointerEvents: "none",
      },
    },
  });
