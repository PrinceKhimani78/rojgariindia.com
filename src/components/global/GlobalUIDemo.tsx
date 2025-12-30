"use client";
import { Button, Stack } from "@mui/material";
import { useGlobalUI } from "./GlobalUIProvider";

export default function GlobalUIDemo() {
  const { showSnackbar, showModal } = useGlobalUI();

  return (
    <Stack direction="row" spacing={2}>
      <Button
        variant="contained"
        color="success"
        onClick={() => showSnackbar("This is a success toast!", "success")}
      >
        Show Success Toast
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={() => showSnackbar("This is an error toast!", "error")}
      >
        Show Error Toast
      </Button>
      <Button
        variant="outlined"
        onClick={() =>
          showModal({
            title: "MUI Modal Demo",
            content: <div>This is a global modal popup!</div>,
          })
        }
      >
        Show Modal
      </Button>
    </Stack>
  );
}
