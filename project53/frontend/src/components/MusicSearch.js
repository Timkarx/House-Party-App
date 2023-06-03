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
  Divider,
  Paper,
  InputBase,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ExpandLess } from "@mui/icons-material";

const MusicSearch = (props) => {
  const [searchQuery, setSearchQuery] = useState(null);
  const [searchResults, setSearchResult] = useState({});
  const [resultReceived, setResultRecieved] = useState(false);
  const [renderSuggested, setRenderSuggested] = useState(false);

  useEffect(() => {
    if (props.suggestedSongs.length >= 1) {
      setRenderSuggested(true);
    } else {
      setRenderSuggested(false);
    }
  }, [props.suggestedSongs]);

  const handleSearchSong = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: searchQuery,
      }),
    };
    console.log(searchQuery);
    fetch("/spotify/search-song", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setSearchResult(data);
        setResultRecieved(true);
      });
  };

  const addQueue = (query) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query_id: query.spotify_id,
        query_duration: query.duration,
        query_name: query.name,
        query_artist: query.artist,
        query_album: query.album,
        query_img: query.img,
      }),
    };
    console.log(query.id);
    fetch("/spotify/add-queue", requestOptions);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return seconds == 60
      ? minutes + 1 + ":00"
      : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }

  const renderSearchResult = () => {
    const searchList = Object.values(searchResults).map((query) => (
      <React.Fragment key={query.spotify_id}>
        <ListItem
          disablePadding
          secondaryAction={millisToMinutesAndSeconds(query.duration)}
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, duration: 1 }}
          whileHover={{ scale: 1.02, duration: 0.1 }}
          whileTap={{ scale: 0.98 }}
        >
          <ListItemButton onClick={() => addQueue(query)}>
            <ListItemIcon sx={{ pr: "10px" }}>
              <img src={query.img} height="100%" width="100%" />
            </ListItemIcon>
            <ListItemText primary={query.name} secondary={query.artist} />
            <ListItemText primary={query.album} />
          </ListItemButton>
        </ListItem>
        <Divider />
      </React.Fragment>
    ));

    return (
      <Box>
        <List
          component={motion.div}
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          transition={{ duration: 0.4 }}
          exit={{ height: 0 }}
        >
          {searchList}
        </List>
        <Box sx={{ display: "flex", justifyContent: "center", p: 0, m: 0 }}>
          <IconButton
            sx={{ p: 0 }}
            size="large"
            onClick={() => {
              setResultRecieved(false);
            }}
          >
            <ExpandLess />
          </IconButton>
        </Box>
      </Box>
    );
  };

  const renderSelectedSongs = () => {
    const selectedSongList = props.suggestedSongs.map((song) => (
      <React.Fragment key={song.spotify_id}>
        <ListItem
          disablePadding
          secondaryAction={millisToMinutesAndSeconds(song.duration)}
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ListItemButton onClick={() => addQueue(song)}>
            <ListItemIcon sx={{ pr: "10px" }}>
              <img src={song.img} height="100%" width="100%" />
            </ListItemIcon>
            <ListItemText primary={song.name} secondary={song.artist} />
            <ListItemText>
              {song.votes} / {props.votes_to_suggest}
            </ListItemText>
          </ListItemButton>
        </ListItem>
        <Divider />
      </React.Fragment>
    ));
    return <List>{selectedSongList}</List>;
  };

  return (
    <Grid item style={{ width: "100%" }}>
      <Card
        sx={{ boxShadow: 12, borderRadius: "16px", bgcolor: "#c7cdc8", mb: 1 }}
      >
        {renderSuggested ? renderSelectedSongs() : null}
      </Card>
      <Card sx={{ boxShadow: 12, borderRadius: "16px", bgcolor: "#c7cdc8" }}>
        <Box display="flex" flexDirection="row" justifyContent="center" m={3}>
          <Paper
            component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: 400,
              bgcolor: "#E9D8E4",
              boxShadow: 12,
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search Spotify"
              onChange={handleSearch}
            />
            <IconButton
              type="button"
              sx={{ p: "10px" }}
              aria-label="search"
              onClick={handleSearchSong}
            >
              <Search />
            </IconButton>
          </Paper>
        </Box>
        <AnimatePresence>
          {resultReceived ? renderSearchResult() : null}
        </AnimatePresence>
      </Card>
    </Grid>
  );
};

export default MusicSearch;
