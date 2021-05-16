import React, { Component } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { BtnCellRenderer, GridProgress } from "../../shared";
import { ColDef } from "ag-grid-community";
import classNames from "classnames";
import { styles } from "./Ladger.styles";
import { withStyles } from "@material-ui/core";
import { RouteComponentProps } from "react-router";
import { IClasses } from "../../interfaces";
import { inject, observer } from "mobx-react";
import { DataStore, UIStore } from "../../stores";

interface Props extends RouteComponentProps {
  classes?: IClasses;
  updateMethod: Function;
  dataStore?: DataStore;
  uiStore?: UIStore;
}

@inject("dataStore", "uiStore")
@observer
class Ladger extends Component<Props> {
  private async cancelStream(streamId: number) {
    const { uiStore, updateMethod } = this.props;
    try {
      uiStore.setPageLoader(true);
      streamId && (await window.contract.cancelStream({ streamId }));
      updateMethod();
      uiStore.setPageLoader(false);
    } catch (error) {
      console.log(error);
      uiStore.setPageLoader(false);
    }
  }

  columnDefs: ColDef[] = [
    {
      headerName: "Status",
      field: "status",
    },
    {
      headerName: "To/From",
      field: "recipient",
    },
    {
      headerName: "Value",
      field: "deposit",
    },
    {
      headerName: "Streamed",
      field: "balanceSent",
      cellRenderer: "progressRenderer",
    },
    {
      headerName: "Start time",
      field: "startDate",
    },
    {
      headerName: "Stop time",
      field: "stopDate",
    },
    {
      headerName: "Action",
      cellRenderer: "actionRenderer",
      cellEditor: "actionRenderer",
      minWidth: 150,
      maxWidth: 210,
      cellRendererParams: {
        clicked: (streamId: number) => this.cancelStream(streamId),
      },
      sortable: false,
      filter: false,
    },
  ];

  frameworkComponents = {
    actionRenderer: BtnCellRenderer,
    progressRenderer: GridProgress,
  };

  defaultColDef = {
    suppressMovable: true,
    resizable: true,
    suppressAutoSize: true,
  };

  render() {
    const { classes, dataStore } = this.props;
    const gridClass = classNames({
      "ag-theme-alpine": true,
      [classes.gridContainer]: true,
    });
    return (
      <div className={gridClass}>
        <AgGridReact
          rowData={dataStore.ledgerData}
          columnDefs={this.columnDefs}
          frameworkComponents={this.frameworkComponents}
          defaultColDef={this.defaultColDef}
        ></AgGridReact>
      </div>
    );
  }
}

export default withStyles(styles)(Ladger);
