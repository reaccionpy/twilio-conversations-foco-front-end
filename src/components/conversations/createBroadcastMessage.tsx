import React, { useState } from "react";
import { Client } from "@twilio/conversations";

import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, AppState } from "../../store";
import { getTranslation } from "./../../utils/localUtils";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  IconButton,
  Slide,
  Toolbar,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { Close } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { styled } from "@mui/material/styles";

interface NewConvoProps {
  client?: Client;
  collapsed: boolean;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateBroadcastButton: React.FC<NewConvoProps> = (
  props: NewConvoProps
) => {
  const dispatch = useDispatch();
  const { updateCurrentConversation, addNotifications, updateParticipants } =
    bindActionCreators(actionCreators, dispatch);

  const local = useSelector((state: AppState) => state.local);
  const createNewConvo = getTranslation(local, "createNewBroadcast");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  const { data, isLoading, isError, error } = useQuery({
    enabled: props.client != null,
    queryFn: async () => {
      const functionUrl = "https://reaccion-6764.twil.io/get-templates";
      return await axios.get(functionUrl, {
        headers: {
          Authorization: `Bearer ${props.client!.token}`,
        },
      });
    },
    queryKey: ["getTemplates"],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <Button variant={"contained"} fullWidth onClick={handleOpen}>
        <PlusIcon decorative={false} title="Add convo" />
        {!props.collapsed ? createNewConvo : null}
      </Button>
      <Dialog
        fullScreen
        open={isModalOpen}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <Close />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Create new broadcast
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              save
            </Button>
          </Toolbar>
        </AppBar>
        <Body></Body>
      </Dialog>
    </>
  );
};

const Body = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}));

export default CreateBroadcastButton;
