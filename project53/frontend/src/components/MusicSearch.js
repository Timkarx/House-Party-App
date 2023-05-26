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

const MusicSearch = () => {
  const [searchQuery, setSearchQuery] = useState(null);
  const [searchResults, setSearchResult] = useState({});
  const [resultReceived, setResultRecieved] = useState(false);

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

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const renderSearchResult = () => {
    const searchList = Object.values(searchResults).map((query) => (
      <>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ pr: "10px" }}>
              <img src={query.img} height="100%" width="100%" />
            </ListItemIcon>
            <ListItemText primary={query.name} secondary={query.album} />
            <ListItemText primary={query.duration} />
          </ListItemButton>
        </ListItem>
        <Divider />
      </>
    ));

    return <List>{searchList}</List>;
  };

  return (
    <Grid item style={{ width: "100%" }}>
      <Card>
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