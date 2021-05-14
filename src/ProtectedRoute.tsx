import React from "react";
import { Route, Redirect } from "react-router-dom";

function ProtectedRoute({
  component: Component,
  isAuthenticated: isAuthenticated,
  updateMethod: updateMethod,
  ...rest
}) {
  return (
    <Route
      {...rest}
      render={(props) => {
        if (isAuthenticated) {
          return <Component {...props} updateMethod={() => updateMethod()} />;
        } else {
          return (
            <Redirect to={{ pathname: "/", state: { from: props.location } }} />
          );
        }
      }}
    />
  );
}

export default ProtectedRoute;
