import React from "react";

import { useHookstate, State } from "@hookstate/core";
import { IProject, SideNavType } from "./types";
import { useRecoilState } from "recoil";
import { sideNavOpenState } from "./state";
import {
  Link as RouterLink,
  useRouteMatch,
  useLocation,
} from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import CommentIcon from "@material-ui/icons/Comment";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import DescriptionIcon from "@material-ui/icons/Description";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { Typography } from "@material-ui/core";

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    list: {
      width: 250,
    },
    drawer: {
      [theme.breakpoints.up("sm")]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    drawerPaper: {
      width: drawerWidth,
    },
    nested: {
      paddingLeft: theme.spacing(3),
    },
    displayNone: {
      display: "none",
    },
    active: {
      backgroundColor: "rgba(0, 0, 0, 0.08)",
    },
  })
);

export default function SideNav() {
  const [sideNavOpen, setSideNavOpen] = useRecoilState(sideNavOpenState);
  const classes = useStyles();

  const toggleDrawer = () => (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
    if (
      event &&
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setSideNavOpen(!sideNavOpen);
  };

  return (
    <SwipeableDrawer
      variant="temporary"
      className={classes.drawer}
      anchor="right"
      open={sideNavOpen}
      onClose={toggleDrawer()}
      onOpen={toggleDrawer()}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <List>
        <ListItem button>
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText primary={"Categories"} />
        </ListItem>
      </List>
    </SwipeableDrawer>
  );
}
