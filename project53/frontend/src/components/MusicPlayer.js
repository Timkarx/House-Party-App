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
import { motion, AnimatePresence } from "framer-motion";
import { PlayArrow, SkipNext, Pause, SkipPrevious } from "@mui/icons-material";

const MusicPlayer = (props) => {
  const songProgress = (props.time / props.duration) * 100;

  const songPlayback = (playback) => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playback: playback,
      }),
    };
    fetch("/spotify/song-playback", requestOptions);
  };

  const skipSong = (previous) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: previous,
      }),
    };
    fetch("/spotify/skip-song", requestOptions)
      .then((response) => response.json())
      .then((data) => {});
    songPlayback();
  };

  const renderPrevSkip = () => {
    return (
      <IconButton
        onClick={() => skipSong(true)}
        component={motion.div}
        whileHover={{ scale: 1.2, duration: 0.1 }}
        whileTap={{ scale: 0.8 }}
      >
        <SkipPrevious />
      </IconButton>
    );
  };

  return (
    <Grid
      item
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      exit={{ opacity: 0 }}
      sx={{width: '100%'}}
    >
      <Card sx={{ boxShadow: 12, borderRadius: "16px", bgcolor: "#FBC40E" }}>
        <Grid container align="center">
          <AnimatePresence>
            <Grid item xs={4}>
              <img src={props.img_url} height="100%" width="100%" />
            </Grid>
          </AnimatePresence>
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
              <Box>
                {props.isHost ? renderPrevSkip() : null}
                <IconButton
                  onClick={() => {
                    props.is_playing ? songPlayback(true) : songPlayback(false);
                  }}
                  component={motion.div}
                  whileHover={{ scale: 1.2, duration: 0.1 }}
                  whileTap={{ scale: 0.8 }}
                >
                  {props.is_playing ? <Pause /> : <PlayArrow />}
                </IconButton>
                <IconButton
                  onClick={() => skipSong(false)}
                  component={motion.div}
                  whileHover={{ scale: 1.2, duration: 0.1 }}
                  whileTap={{ scale: 0.8 }}
                >
                  <SkipNext />
                </IconButton>
                <Typography component="h6" variant="h6" color="textSecondary">
                  Votes to skip: {props.votes} / {props.votes_required}
                </Typography>
              </Box>
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
