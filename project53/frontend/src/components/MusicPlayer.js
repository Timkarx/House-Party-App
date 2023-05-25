import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Grid,
  Button,
  Typography,
  Card,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { PlayArrow, SkipNext, Pause } from "@mui/icons-material";

const MusicPlayer = (props) => {
  const songProgress = (props.time / props.duration) * 100;

  const pauseSong = () => {
    const requestOptions ={
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
    };
    fetch('/spotify/pause-song', requestOptions)
  }

  const playSong = () => {
    const requestOptions ={
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
    };
    fetch('/spotify/play-song', requestOptions)
  }

  const skipSong = () => {
    const requestOptions = {
      method: 'POST',
      headers: {'COntent-Type': 'application/json'}
    };
    fetch('/spotify/skip', requestOptions);
  }

  return (
    <Card>
      <Grid container align="center">
        <Grid item xs={4}>
          <img src={props.img_url} height="100%" width="100%" />
        </Grid>
        <Grid item xs={8}>
          <Typography component="h5" variant="h5">
            {props.title}
          </Typography>
          <Typography color="textSecondary" variant="subtitle1">
            {props.artist}
          </Typography>
          <div>
            <IconButton onClick={() => {props.is_playing ? pauseSong() : playSong()}}>
              {props.is_playing ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton onClick={() => skipSong()}>
              <SkipNext />
            </IconButton>
          </div>
        </Grid>
      </Grid>
      <LinearProgress
        variant="determinate"
        value={songProgress}
      ></LinearProgress>
    </Card>
  );
};

export default MusicPlayer;
