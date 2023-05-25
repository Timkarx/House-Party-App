import React, { useState, useEffect } from "react";
import { TextField, Button, Grid, Typography } from "@mui/material";
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
                code: roomCode
            })
        };
        fetch('/api/join-room', requestOptions).then((response) => {
            if (response.ok) {
                navigate(`/room/${roomCode}`)
            } else {
                setError(true)
            }
        })
    }

  return (
    <Grid container spacing={1} align="center">
      <Grid item xs={12}>
        <Typography component="h4" variant="h4">
          Join a Room
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          error={error}
          label="code"
          placeholder="Enter a Room Code"
          variant="outlined"
          onChange={handleTextFieldChange}
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant='contained' color='secondary' onClick={handleRoomButtonPress}>Enter Room</Button>
      </Grid>
      <Grid item xs={12}>
        <Button variant='contained' color='primary' to='/' component={Link}>Back</Button>
      </Grid>
    </Grid>
  );
};

export default RoomJoinPage