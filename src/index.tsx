import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { RootStore } from "./stores";
import { Provider } from "mobx-react";
import { NearService } from "./services";

const rootStore = new RootStore();

NearService.initContract()
  .then(({ contract, nearConfig, walletConnection, account }) => {
    ReactDOM.render(
      <Provider {...rootStore}>
        <App
          contract={contract}
          nearConfig={nearConfig}
          walletConnection={walletConnection}
          account={account}
        />
      </Provider>,
      document.querySelector("#root")
    );
  })
  .catch((err) => {
    console.log("init error", err);
  });
