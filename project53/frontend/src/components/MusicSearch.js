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
import { Search } from "@mui/icons-material";

const MusicSearch = (props) => {
  const [searchQuery, setSearchQuery] = useState(null);
  const [searchResults, setSearchResult] = useState({});
  const [resultReceived, setResultRecieved] = useState(false);
  const [renderSuggested, setRenderSuggested] = useState(false)
  const [suggestedSongs, setSuggestedSongs] = useState([])

  useEffect(() => {
    if (props.suggestedSongs.length >= 1) {
      setRenderSuggested(true)
    } else {
      setRenderSuggested(false)
    }
    console.log(props.suggestedSongs)
  }, [props.suggestedSongs])

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
        query_id: query.id,
        query_duration: query.duration,
        query_name: query.name,
        query_artist: query.artists,
        query_album: query.album,
        query_img: query.img
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
      <React.Fragment key={query.id}>
        <ListItem disablePadding secondaryAction={millisToMinutesAndSeconds(query.duration)}>
          <ListItemButton onClick={() => addQueue(query)}>
            <ListItemIcon sx={{ pr: "10px" }}>
              <img src={query.img} height="100%" width="100%" />
            </ListItemIcon>
            <ListItemText primary={query.name} secondary={query.artists} />
            <ListItemText primary={query.album} />
          </ListItemButton>
        </ListItem>
        <Divider />
      </React.Fragment>
    ));

    return <List>{searchList}</List>;
  };

  const renderSelectedSongs = () => {
    const selectedSongList = props.suggestedSongs.map((song) => (
      <React.Fragment key={song[5]}>
        <ListItem disablePadding secondaryAction={millisToMinutesAndSeconds(song[3])}>
          <ListItemIcon sx={{ pr: "10px" }}>
            <img src={song[4]} height="100%" width="100%" />
          </ListItemIcon>
          <ListItemText primary={song[0]} secondary={song[2]} />
          <ListItemText primary={song[1]} />
          <ListItemText>{song[6]} / {props.votesToSuggestSong}</ListItemText>
        </ListItem>
        <Divider />
      </React.Fragment>
    ));
    return <List>{selectedSongList}</List>
  };

  return (
    <Grid item style={{ width: "100%" }}>
      <Card>
      {renderSuggested ? renderSelectedSongs() : null}
      </Card>
      <Card sx={{ boxShadow: 12, borderRadius: '16px'}}>
        <Box display="flex" flexDirection="row" justifyContent="center" m={3}>
          <Paper
            component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: 400,
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
        {resultReceived ? renderSearchResult() : null}
      </Card>
    </Grid>
  );
};

export default MusicSearch;
