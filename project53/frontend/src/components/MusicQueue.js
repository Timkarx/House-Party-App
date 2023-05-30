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
          disablePadding
          secondaryAction={millisToMinutesAndSeconds(song.duration)}
        >
          <ListItemButton>
            <ListItemIcon sx={{ pr: "10px" }}>
              <img src={song.img} height="100%" width="100%" />
            </ListItemIcon>
            <ListItemText primary={song.name} secondary={song.artists} />
            <ListItemText primary={song.album} />
          </ListItemButton>
        </ListItem>
        <Divider />
      </React.Fragment>
    ));
    return <List>{queueList}</List>;
  };

  return (
    <Grid item style={{ width: "100%" }}>
      <Card>
        <Typography
          component="h4"
          variant="h4"
          align="center"
          style={{ color: "primary" }}
        >
          Queue
        </Typography>
        {renderQueue()}
      </Card>
    </Grid>
  );
};

export default MusicQueue;
