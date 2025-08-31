import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

function ConfirmationDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={() => onClose(false)}>
      <DialogTitle>保存確認</DialogTitle>
      <DialogContent>保存しますか？</DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>No</Button>
        <Button onClick={() => onClose(true)}>Yes</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialog;