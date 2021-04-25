import React from "react";

import { useHookstate, State } from "@hookstate/core";
import { IProject, SideNavType } from "./types";
import { useRecoilState } from "recoil";
import { pageNavOpenState } from "./state";
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
      [theme.breakpoints.up("md")]: {
        marginTop: "64px"
      },
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

export default function PageNav(props: {
  project: State<IProject>;
  navType: SideNavType;
}) {
  const project = useHookstate(props.project);
  const [pageNavOpen, setPageNavOpen] = useRecoilState(pageNavOpenState);
  const classes = useStyles();
  const { url } = useRouteMatch();
  const location = useLocation();

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

    setPageNavOpen(!pageNavOpen);
  };

  const buildStepCategories = () => {
    return project.buildSteps.map((bs, index) => (
      <ListItem
        key={index}
        button
        className={classes.nested}
        selected={location.hash === `#${bs.id.value}`}
        component={HashLink}
        to={`${url}/build-log#${bs.id.value.toString()}`}
      >
        <ListItemText
          primary={
            <>
              <strong>Step {(index + 1).toString()}: </strong>
              {bs.title.value}
            </>
          }
        />
      </ListItem>
    ));
  };

  // TODO: Might be able to change to a boolean in the future if the other types are not needed.
  const displayTopCategories =
    props.navType === SideNavType.Project ? "" : classes.displayNone;

  const list = () => (
    <div className={classes.list} role="presentation">
      <div className={displayTopCategories}>
        <List>
          <ListItem
            button
            selected={
              location.pathname === `${url}/description` ||
              location.pathname == `${url}`
            }
            component={RouterLink}
            to={`${url}/description`}
          >
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary={"Description"} />
          </ListItem>
          <ListItem
            button
            selected={location.pathname === `${url}/comments`}
            component={RouterLink}
            to={`${url}/comments`}
          >
            <ListItemIcon>
              <CommentIcon />
            </ListItemIcon>
            <ListItemText primary={"Comments"} />
          </ListItem>
          <ListItem
            button
            selected={location.pathname === `${url}/files`}
            component={RouterLink}
            to={`${url}/files`}
          >
            <ListItemIcon>
              <CloudDownloadIcon />
            </ListItemIcon>
            <ListItemText primary={"Files"} />
          </ListItem>
        </List>
        <Divider />
      </div>
      <List>
        {props.navType === SideNavType.Project ? (
          <ListItem
            button
            selected={location.pathname === `${url}/build-log`}
            component={RouterLink}
            to={`${url}/build-log`}
          >
            <ListItemIcon>
              <FormatListNumberedIcon />
            </ListItemIcon>
            <ListItemText primary={"Build Log"} />
          </ListItem>
        ) : (
          <ListItem
            button
            selected={location.pathname === `${url}/build-log`}
            onClick={() => window.scrollTo(0, 0)}
          >
            <ListItemIcon>
              <FormatListNumberedIcon />
            </ListItemIcon>
            <ListItemText primary={"Build Log"} />
          </ListItem>
        )}

        <List component="div" disablePadding>
          {buildStepCategories()}
        </List>
      </List>
    </div>
  );

  return (
    <>
      <Hidden smDown>
        <Drawer
          elevation={4}
          anchor="left"
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          {list()}
        </Drawer>
      </Hidden>
      <Hidden mdUp>
        <SwipeableDrawer
          variant="temporary"
          className={classes.drawer}
          anchor="left"
          open={pageNavOpen}
          onClose={toggleDrawer()}
          onOpen={toggleDrawer()}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          {list()}
        </SwipeableDrawer>
      </Hidden>
    </>
  );
}
