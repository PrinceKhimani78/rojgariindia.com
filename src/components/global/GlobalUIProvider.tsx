"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";

// Snackbar/Toaster
interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}
// Modal
interface ModalState {
  open: boolean;
  title?: string;
  content?: ReactNode;
  actions?: ReactNode;
}

interface GlobalUIContextProps {
  showSnackbar: (message: string, severity?: AlertColor) => void;
  showModal: (options: {
    title?: string;
    content?: ReactNode;
    actions?: ReactNode;
  }) => void;
  closeModal: () => void;
}

const GlobalUIContext = createContext<GlobalUIContextProps | undefined>(
  undefined
);

export const useGlobalUI = () => {
  const ctx = useContext(GlobalUIContext);
  if (!ctx) throw new Error("useGlobalUI must be used within GlobalUIProvider");
  return ctx;
};

export const GlobalUIProvider = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  // Snackbar state
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  // Modal state
  const [modal, setModal] = useState<ModalState>({ open: false });

  // Show snackbar
  const showSnackbar = (message: string, severity: AlertColor = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Show modal
  const showModal = (options: {
    title?: string;
    content?: ReactNode;
    actions?: ReactNode;
  }) => {
    setModal({ open: true, ...options });
  };

  // Close modal
  const closeModal = () => setModal({ open: false });

  return (
    <GlobalUIContext.Provider value={{ showSnackbar, showModal, closeModal }}>
      {children}
      {/* Snackbar/Toaster */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        // center the snackbar in the middle of the viewport
        sx={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: theme.zIndex.snackbar + 2000,
        }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{
            width: "auto",
            maxWidth: 480,
            px: 2,
            py: 1,
            borderRadius: 2,
            boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
            backgroundColor:
              snackbar.severity === "error"
                ? "#d32f2f"
                : theme.palette.primary.main,
            color:
              snackbar.severity === "error"
                ? "#fff"
                : theme.palette.primary.contrastText,
          }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
      {/* Modal/Popup */}
      <Dialog
        open={modal.open}
        onClose={closeModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            m: 0,
            minHeight: 200,
            backgroundColor: theme.palette.background.default,
            borderRadius: 3,
          },
        }}
        sx={{
          "& .MuiDialog-container": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        {modal.title && (
          <DialogTitle
            sx={{ color: theme.palette.primary.main, fontWeight: 700 }}
          >
            {modal.title}
          </DialogTitle>
        )}
        {modal.content && <DialogContent>{modal.content}</DialogContent>}
        {modal.actions ? (
          <DialogActions>{modal.actions}</DialogActions>
        ) : (
          <DialogActions>
            <Button onClick={closeModal} color="primary">
              Close
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </GlobalUIContext.Provider>
  );
};
