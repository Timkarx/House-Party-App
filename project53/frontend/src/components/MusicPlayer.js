import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Grid,
  Button,
  Box,
  Typography,
  Card,
  IconButton,
  LinearProgress,
  TextField,
} from "@mui/material";
import { PlayArrow, SkipNext, Pause } from "@mui/icons-material";

const MusicPlayer = (props) => {

  const songProgress = (props.time / props.duration) * 100;

  const songPlayback = (playback) => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playback: playback
      })
    };
    fetch("/spotify/song-playback", requestOptions);
  };

  const skipSong = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/skip-song", requestOptions)
      .then((response) => response.json())
      .then((data) => {
      });
  };

  return (
    <Grid item>
      <Card sx={{ boxShadow: 12, borderRadius: '16px', bgcolor: '#c7cdc8'}} >
        <Grid container align="center">
          <Grid item xs={4}>
            <img src={props.img_url} height="100%" width="100%" />
          </Grid>
          <Grid item xs={8}>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              height="100%"
            >
              <Typography component="h5" variant="h5">
                {props.title}
              </Typography>
              <Typography color="textSecondary" variant="subtitle1">
                {props.artist}
              </Typography>
              <div>
                <IconButton
                  onClick={() => {
                    props.is_playing ? songPlayback(true) : songPlayback(false);
                  }}
                >
                  {props.is_playing ? <Pause /> : <PlayArrow />}
                </IconButton>
                <IconButton onClick={() => skipSong()}>
                  <SkipNext />
                </IconButton>
                <Typography component="h6" variant="h6" color="textSecondary">
                  Votes to skip: {props.votes} / {props.votes_required}
                </Typography>
              </div>
            </Box>
          </Grid>
        </Grid>
        <LinearProgress
          variant="determinate"
          value={songProgress}
        ></LinearProgress>
      </Card>
    </Grid>
  );
};

export default MusicPlayer;
