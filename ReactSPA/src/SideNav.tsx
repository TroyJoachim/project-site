import React from "react";

import { useHookstate, State } from "@hookstate/core";
import { Link, useRouteMatch, useLocation } from "react-router-dom";
import { IBuildStep, SideNavCategory, IProject } from "./types";
import { useRecoilState } from "recoil";
import { sideMenuOpenState, sideMenuCategoryState } from "./state";
import {
  makeStyles,
  Theme,
  useTheme,
  createStyles,
} from "@material-ui/core/styles";
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
      top: "64px",
      [theme.breakpoints.down("xs")]: {
        top: "56px",
      },
    },
    nested: {
      paddingLeft: theme.spacing(3),
    },
  })
);

export default function SideNav(props: { project: State<IProject> }) {
  const project = useHookstate(props.project);
  const classes = useStyles();
  const [sideNavOpen, setSideNavOpen] = useRecoilState(sideMenuOpenState);
  const [sideNavCategory, setSideNavCategory] = useRecoilState(
    sideMenuCategoryState
  );

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

  const handleBuildStepClick = () => {
    setSideNavCategory({ category: SideNavCategory.BuildLog, buildStep: 0 });
  };

  const handleClick = (category: SideNavCategory) => {
    setSideNavCategory({ category: category, buildStep: -1 });
  };

  const buildStepCategories = () => {
    return project.buildSteps.map((bs, index) => (
      <ListItem
        button
        className={classes.nested}
        onClick={() => {
          setSideNavCategory({
            category: SideNavCategory.BuildLog,
            buildStep: index,
          });
        }}
        selected={sideNavCategory.buildStep === index}
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

  const list = () => (
    <div className={classes.list} role="presentation">
      <List>
        <ListItem
          button
          onClick={() => handleClick(SideNavCategory.Description)}
          selected={sideNavCategory.category === SideNavCategory.Description}
        >
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText primary={"Description"} />
        </ListItem>
        <ListItem
          button
          onClick={() => handleClick(SideNavCategory.Comments)}
          selected={sideNavCategory.category === SideNavCategory.Comments}
        >
          <ListItemIcon>
            <CommentIcon />
          </ListItemIcon>
          <ListItemText primary={"Comments"} />
        </ListItem>
        <ListItem
          button
          onClick={() => handleClick(SideNavCategory.Files)}
          selected={sideNavCategory.category === SideNavCategory.Files}
        >
          <ListItemIcon>
            <CloudDownloadIcon />
          </ListItemIcon>
          <ListItemText primary={"Files"} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem
          button
          onClick={handleBuildStepClick}
          selected={sideNavCategory.category === SideNavCategory.BuildLog}
        >
          <ListItemIcon>
            <FormatListNumberedIcon />
          </ListItemIcon>
          <ListItemText primary={"Build Log"} />
        </ListItem>
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
          open={sideNavOpen}
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
