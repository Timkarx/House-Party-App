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
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { PlayArrow, SkipNext, Pause, Inbox, Drafts } from "@mui/icons-material";

const MusicSearch = () => {
  const [searchQuery, setSearchQuery] = useState(null);
  const [result_1_name, setResultName] = useState(null);
  const [result_1_img, setResultImg] = useState(null);

  const handlesearchSong = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        search_query: searchQuery,
      }),
    };
    fetch("/spotify/search-song", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setResultName = data.track_name;
        setResultImg = data.album_cover;
      });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Grid item style={{ width: "100%" }}>
      <Card>
        <Box display="flex" flexDirection="row" justifyContent="center" m={3}>
          <TextField
            label=""
            placeholder="Search a song"
            variant="outlined"
            onChange={handleSearch}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handlesearchSong}
          >
            Search
          </Button>
        </Box>
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <Inbox />
              </ListItemIcon>
              <ListItemText primary="Inbox" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <Drafts />
              </ListItemIcon>
              <ListItemText primary="Drafts" />
            </ListItemButton>
          </ListItem>
        </List>
      </Card>
    </Grid>
  );
};

export default MusicSearch;
