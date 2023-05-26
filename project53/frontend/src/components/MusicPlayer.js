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

  const pauseSong = () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/pause-song", requestOptions);
  };

  const playSong = () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/play-song", requestOptions);
  };

  const skipSong = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/spotify/skip-song", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      });
  };

  return (
    <Grid item>
      <Card >
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
                    props.is_playing ? pauseSong() : playSong();
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
