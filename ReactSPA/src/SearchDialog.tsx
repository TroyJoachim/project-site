import React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import PersonIcon from "@material-ui/icons/Person";
import AddIcon from "@material-ui/icons/Add";
import SearchIcon from "@material-ui/icons/Search";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import { grey } from "@material-ui/core/colors";
import Slide from "@material-ui/core/Slide";
import { TransitionProps } from "@material-ui/core/transitions";
import { useHookstate, State } from "@hookstate/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogPaper: {
      position: "absolute",
      top: 25,
    },
    titleRoot: {
      backgroundColor: grey[100],
      padding: "24px",
    },
    textFieldRoot: {
      backgroundColor: "#ffffff",
    },
  })
);

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function SearchDialog(props: { open: State<boolean> }) {
  const open = useHookstate(props.open);
  const classes = useStyles();

  const handleClose = () => {
    open.set(false);
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      TransitionComponent={Transition}
      keepMounted
      open={open.value}
      maxWidth="md"
      fullWidth
      classes={{ paper: classes.dialogPaper }}
    >
      <form>
        <DialogTitle classes={{ root: classes.titleRoot }}>
          <TextField
            id="outlined-full-width"
            label="Search"
            fullWidth
            margin="none"
            placeholder="Search terms here..."
            classes={{ root: classes.textFieldRoot }}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
        </DialogTitle>
      </form>
    </Dialog>
  );
}
