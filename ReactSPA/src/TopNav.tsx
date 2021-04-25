import { useEffect, useState } from "react";
import { useHookstate } from "@hookstate/core";
import { useHistory } from "react-router-dom";
import { getProjectCategories } from "./agent";
import { ICategory } from "./types";
import { globalState, signOut } from "./globalState";
import { useRecoilState } from "recoil";
import { sideNavOpenState } from "./state";
import SearchDialog from "./SearchDialog";

// Material UI
import {
  makeStyles,
  Theme,
  createStyles,
  useTheme,
} from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import Badge from "@material-ui/core/Badge";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import MoreIcon from "@material-ui/icons/MoreVert";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import CollectionsIcon from "@material-ui/icons/Collections";
import MailIcon from "@material-ui/icons/Mail";
import NotificationsIcon from "@material-ui/icons/Notifications";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import AccountCircle from "@material-ui/icons/AccountCircle";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import AssignmentIcon from "@material-ui/icons/Assignment";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    grow: {
      flexGrow: 1,
    },
    menuButton: {
      marginLeft: theme.spacing(1),
      [theme.breakpoints.up("md")]: {
        display: "none",
      },
    },
    inputRoot: {
      color: "inherit",
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("md")]: {
        width: "20ch",
      },
    },
    sectionDesktop: {
      display: "none",
      [theme.breakpoints.up("md")]: {
        display: "flex",
      },
    },
    sectionMobile: {
      display: "flex",
      [theme.breakpoints.up("md")]: {
        display: "none",
      },
    },
    btnRoot: {
      borderColor: "#ffffff",
      color: "#ffffff",
    },
    signInBtn: {
      margin: "5px 10px",
    },
    listItemIconRoot: {
      minWidth: "35px",
    },
  })
);

export default function TopNav() {
  const gState = useHookstate(globalState);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [
    mobileMoreAnchorEl,
    setMobileMoreAnchorEl,
  ] = useState<null | HTMLElement>(null);
  const [sideNavOpen, setSideNavOpen] = useRecoilState(sideNavOpenState);
  const searchDialogOpen = useHookstate(false);
  const history = useHistory();
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    // getProjectCategories().then((response) => {
    //   if (response && response.status === 200) {
    //     categories.set(response.data);
    //   }
    // });
  }, []); // Note: Empty array at the end ensures that this is only performed once during mount

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const toggleSideNav = () => {
    setSideNavOpen(!sideNavOpen);
  };

  const handleMyAccountClick = () => {
    history.push(`/my-account/${gState.username.value}`);
    handleMenuClose();
  };

  const handleSearchDialogOpen = () => {
    searchDialogOpen.set(true);
  };

  const appBarPosition = () => (matches ? "fixed" : "absolute");

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>
        <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
          <AssignmentIcon />
        </ListItemIcon>
        <ListItemText primary="My Projects" />
      </MenuItem>

      <MenuItem onClick={handleMenuClose}>
        <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
          <ThumbUpIcon />
        </ListItemIcon>
        <ListItemText primary="My Likes" />
      </MenuItem>

      <MenuItem onClick={handleMenuClose}>
        <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
          <CollectionsIcon />
        </ListItemIcon>
        <ListItemText primary="My Collects" />
      </MenuItem>

      <MenuItem onClick={handleMyAccountClick}>
        <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
          <AccountCircle />
        </ListItemIcon>
        <ListItemText primary="My account" />
      </MenuItem>

      <MenuItem onClick={signOut}>
        <ListItemIcon classes={{ root: classes.listItemIconRoot }}>
          <ExitToAppIcon />
        </ListItemIcon>
        <ListItemText primary="Sign out" />
      </MenuItem>
    </Menu>
  );
  // const renderCategoryMenu = (
  //   <Menu
  //     anchorEl={anchorEl}
  //     anchorOrigin={{ vertical: "top", horizontal: "right" }}
  //     id={"category-menu"}
  //     keepMounted
  //     transformOrigin={{ vertical: "top", horizontal: "right" }}
  //     open={isMenuOpen}
  //     onClose={handleMenuClose}
  //     marginThreshold={0}
  //     PaperProps={{
  //       style: {
  //         width: "100%",
  //         maxWidth: "100%",
  //         left: 0,
  //         right: 0,
  //       },
  //     }}
  //   ></Menu>
  // );

  // const mobileMenuId = "primary-search-account-menu-mobile";

  const avatarUrl =
    "https://d1sam1rvgl833u.cloudfront.net/fit-in/40x40/protected/" +
    gState.identityId.value +
    "/user-avatar.png";

  // const renderMobileMenu = (
  //   <Menu
  //     anchorEl={mobileMoreAnchorEl}
  //     anchorOrigin={{ vertical: "top", horizontal: "right" }}
  //     id={mobileMenuId}
  //     keepMounted
  //     transformOrigin={{ vertical: "bottom", horizontal: "right" }}
  //     open={isMobileMenuOpen}
  //     onClose={handleMobileMenuClose}
  //   >
  //     <MenuItem>
  //       <IconButton aria-label="show 4 new mails" color="inherit">
  //         <Badge badgeContent={4} color="secondary">
  //           <MailIcon />
  //         </Badge>
  //       </IconButton>
  //       <p>Messages</p>
  //     </MenuItem>
  //     <MenuItem>
  //       <IconButton aria-label="show 11 new notifications" color="inherit">
  //         <Badge badgeContent={11} color="secondary">
  //           <NotificationsIcon />
  //         </Badge>
  //       </IconButton>
  //       <p>Notifications</p>
  //     </MenuItem>
  //     <MenuItem onClick={handleProfileMenuOpen}>
  //       <IconButton
  //         aria-label="account of current user"
  //         aria-controls="primary-search-account-menu"
  //         aria-haspopup="true"
  //         color="inherit"
  //       >
  //         {gState.isAuthenticated ? (
  //           <Avatar
  //             alt={gState.username.value ? gState.username.value : ""}
  //             src={avatarUrl}
  //           />
  //         ) : (
  //           <AccountCircle />
  //         )}
  //       </IconButton>
  //       <p>Profile</p>
  //     </MenuItem>
  //   </Menu>
  // );

  return (
    <>
      <AppBar position={appBarPosition()} className={classes.appBar}>
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            onClick={() => {
              history.push("/");
            }}
          >
            Material-UI
          </Typography>
          <div className={classes.grow} />
          <IconButton
            aria-label="search"
            color="inherit"
            onClick={handleSearchDialogOpen}
          >
            <SearchIcon />
          </IconButton>
          <IconButton aria-label="show 4 new mails" color="inherit">
            <Badge badgeContent={4} color="secondary">
              <MailIcon />
            </Badge>
          </IconButton>
          <IconButton aria-label="show 17 new notifications" color="inherit">
            <Badge badgeContent={17} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          {gState.isAuthenticated.value ? (
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar
                alt={gState.username.value ? gState.username.value : ""}
                src={avatarUrl}
              />
            </IconButton>
          ) : (
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              classes={{ root: classes.btnRoot }}
              className={classes.signInBtn}
              onClick={() => history.push("/sign-in")}
            >
              SIGN IN
            </Button>
          )}
          {/* <div className={classes.sectionMobile}>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </div> */}
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="open side navigation"
            onClick={toggleSideNav}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <SearchDialog open={searchDialogOpen} />
      {renderMenu}
    </>
  );
}
