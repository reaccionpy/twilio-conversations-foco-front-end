import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { ReactElement } from "react";

import { Box, Spinner } from "@twilio-paste/core";

import Login from "./login/login";
import AppContainer from "./AppContainer";
import { actionCreators, AppState } from "../store";
import { getToken } from "../api";

function App(): ReactElement {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { login } = bindActionCreators(actionCreators, dispatch);
  const token = useSelector((state: AppState) => state.token);
  const storedToken = localStorage.getItem("token");

  const setToken = (token: string) => {
    login(token);
    setLoading(false);
  };
  useEffect(() => {
    if (storedToken != null) {
      setToken(storedToken);
    }
  }, [storedToken]);

  if (!token && !loading) {
    return <Login setToken={setToken} />;
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        position="absolute"
        height="100%"
        width="100%"
      >
        <Spinner size="sizeIcon110" decorative={false} title="Loading" />
      </Box>
    );
  }

  return <AppContainer />;
}

export default App;
