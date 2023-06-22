import React, { useState, useEffect } from "react";
import {
  Grid,
  Button,
  Box,
  Typography,
  Card,
  IconButton,
  LinearProgress,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  InputBase,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const MusicQueue = (props) => {
  function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return seconds == 60
      ? minutes + 1 + ":00"
      : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }

  const renderQueue = () => {
    const queueList = Object.values(props.queue).map((song) => (
      <React.Fragment key={song.id}>
        <ListItem
          secondaryAction={millisToMinutesAndSeconds(song.duration)}
        >
          <ListItemIcon sx={{ pr: "10px" }}>
            <img src={song.img} height="100%" width="100%" />
          </ListItemIcon>
          <ListItemText primary={song.name} secondary={song.artists} />
          <ListItemText primary={song.album} />
        </ListItem>
        <Divider />
      </React.Fragment>
    ));
    return <List>{queueList}</List>;
  };

  return (
    <AnimatePresence>
      <Grid
        item
        style={{ width: "100%" }}
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        exit={{ opacity: 0 }}
      >
        <Card sx={{ boxShadow: 12, borderRadius: "16px", bgcolor: "#c7cdc8" }}>
          <Typography
            component="h5"
            variant="h5"
            align="center"
            justifyContent="center"
            sx={{pt: 3}}
          >
            Queue
          </Typography>
          {renderQueue()}
        </Card>
      </Grid>
    </AnimatePresence>
  );
};

export default MusicQueue;
