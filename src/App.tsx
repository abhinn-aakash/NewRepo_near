import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { createMuiTheme, ThemeProvider, withTheme } from "@material-ui/core";
import { inject, observer } from "mobx-react";

import { IClasses } from "./interfaces";
import { Dashboard, Ladger, LoginPage, Streamform } from "./pages";
import { PageLayout } from "./shared";
import ProtectedRoute from "./ProtectedRoute";
import { AuthService } from "./services";
import { DataStore } from "./stores";
import Theme from "./Theme";

type Props = {
  contract: any;
  nearConfig: any;
  walletConnection: any;
  account: any;
  classes?: IClasses;
  dataStore?: DataStore;
};

@inject("dataStore")
@observer
class App extends Component<Props> {
  private get isAuthenticated(): boolean {
    const { contract } = this.props;
    return Boolean(contract.account.accountId);
  }

  private get getAccountId(): string {
    const { contract } = this.props;
    return contract.account.accountId;
  }

  componentDidMount() {
    this.initData();
    setInterval(() => this.initData(), 10000);
  }

  initData() {
    const { contract, dataStore, account } = this.props;

    contract
      .getSpent({ accountId: this.getAccountId })
      .then((spent) => dataStore.getSpent(spent))
      .catch((error) => null);
    contract
      .getEarnings({
        accountId: this.getAccountId,
      })
      .then((earned) => dataStore.getEarnings(earned))
      .catch((error) => null);
    account
      .getAccountBalance()
      .then((bal) => dataStore.getTotalAmount(bal.total))
      .catch((error) => null);
    this.updateLedgerSheet();
  }

  updateLedgerSheet() {
    const { contract } = this.props;
    contract
      .getStreamsByAccountId({
        accountId: this.getAccountId,
      })
      .then((a) => this.props.dataStore.getLedgerData(a))
      .catch((err) => null);
  }

  render() {
    const { classes, contract, walletConnection } = this.props;
    return (
      // use React Fragment, <>, to avoid wrapping elements in unnecessary div
      <>
        <ThemeProvider theme={createMuiTheme(Theme)}>
          <Router>
            <PageLayout
              isAuthenticated={this.isAuthenticated}
              contractId={this.getAccountId}
            >
              <Switch>
                <Route
                  path="/"
                  exact
                  render={(props) => {
                    return this.isAuthenticated ? (
                      <Redirect to="/dashboard" />
                    ) : (
                      <LoginPage {...props} login={() => AuthService.login()} />
                    );
                  }}
                ></Route>
                <ProtectedRoute
                  isAuthenticated={this.isAuthenticated}
                  path="/dashboard"
                  component={Dashboard}
                  updateMethod={() => this.initData()}
                />
                <ProtectedRoute
                  isAuthenticated={this.isAuthenticated}
                  path="/stream-form"
                  component={Streamform}
                  updateMethod={() => this.initData()}
                />
                <ProtectedRoute
                  isAuthenticated={this.isAuthenticated}
                  path="/ladger"
                  component={Ladger}
                  updateMethod={() => this.initData()}
                />
                <Route path="*">
                  <div>404 not found</div>
                </Route>
              </Switch>
            </PageLayout>
          </Router>
        </ThemeProvider>
      </>
    );
  }
}
export default withTheme(App);
