import { makeStyles } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Typography from "@material-ui/core/Typography";
import { useRecoilState } from "recoil";
import { pageNavOpenState } from "./state";
import Slide from "@material-ui/core/Slide";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import React from "react";

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: grey[300],
    color: "#000",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  },
}));

function HideOnScroll(props: { children: React.ReactElement }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {props.children}
    </Slide>
  );
}

export default function PageAppBar() {
  const [pageNavOpen, setPageNavOpen] = useRecoilState(pageNavOpenState);
  const classes = useStyles();

  const togglePageNav = () => {
    setPageNavOpen(!pageNavOpen);
  };

  return (
    <HideOnScroll>
      <AppBar className={classes.appBar} position="sticky">
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={togglePageNav}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Contents
          </Typography>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
}
