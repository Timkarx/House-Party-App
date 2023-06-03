import React, { useState } from "react";
import { TextField, Button, Grid, Typography, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const RoomJoinPage = () => {
  const [roomCode, setRoomCode] = useState();
  const [error, setError] = useState();
  const navigate = useNavigate();

  const handleTextFieldChange = (e) => {
    setRoomCode(e.target.value);
  };

  const handleRoomButtonPress = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: roomCode,
      }),
    };
    fetch("/api/join-room", requestOptions).then((response) => {
      if (response.ok) {
        navigate(`/room/${roomCode}`);
      } else {
        setError(true);
      }
    });
  };

  return (
    <Grid container spacing={1} align="center" sx={{ height: "100vh" }}>
      <Grid item xs={12}>
        <Typography component="h4" variant="h4" sx={{ pt: 6 }}>
          Join a Room
        </Typography>
      </Grid>
      <Grid
        item
        display="flex"
        align="center"
        alignItems="center"
        justifyContent="center"
      >
        <Box width="50%" textAlign="center">
          <Typography variant="h6" compact="h6">
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat."
          </Typography>
        </Box>
      </Grid>
      <Grid
        item
        xs={12}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <TextField
          error={error}
          label="Enter a Room Code"
          variant="outlined"
          onChange={handleTextFieldChange}
        />
      </Grid>
      <Grid item xs={12}>
        <Grid item xs={12} sx={{pb: 3}}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleRoomButtonPress}
          >
            Enter Room
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" to="/" component={Link}>
            Back
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default RoomJoinPage;
