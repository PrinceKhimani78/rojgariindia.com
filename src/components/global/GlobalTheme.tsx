"use client";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";

// Main theme color
const PRIMARY_COLOR = "#72B76A";
const SECONDARY_COLOR = "#2B2D42";

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: PRIMARY_COLOR,
      contrastText: "#fff",
    },
    secondary: {
      main: SECONDARY_COLOR,
    },
    success: {
      main: PRIMARY_COLOR,
    },
    error: {
      main: "#e53935",
    },
    warning: {
      main: "#fbc02d",
    },
    info: {
      main: "#1976d2",
    },
    background: {
      default: "#fff",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          minHeight: "200px",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: PRIMARY_COLOR,
          fontWeight: 700,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        filledSuccess: {
          backgroundColor: PRIMARY_COLOR,
          color: "#fff",
        },
      },
    },
  },
});

export function GlobalThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
}
