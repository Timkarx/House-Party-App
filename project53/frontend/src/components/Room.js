import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Grid,
  Button,
  Typography,
  Box,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import { Menu } from "@mui/icons-material";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import MusicSearch from "./MusicSearch";
import MusicQueue from "./MusicQueue";
import NavBar from "./NavBar";

const Room = ({ leaveRoomCallback }) => {
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [votesToSuggestSong, setVotesToSuggestSong] = useState(0)
  const [guestCanPause, setGuestCanPause] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [song, setSong] = useState({});
  const [retryAfter, setRetryAfter] = useState(0);
  const [queue, setQueue] = useState({});
  const [suggestedSongs, setSuggestedSongs] = useState([])

  const { roomCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentSong();
    getQueue();

    const interval1 = setInterval(() => {
      if (retryAfter <= 0) {
        getCurrentSong();
        getQueue()
      } else {
        setRetryAfter((prevRetryAfter) => prevRetryAfter - 1000);
      }
    }, 1000);

    return () => clearInterval(interval1);
  }, []);

  useEffect(() => {
    if (retryAfter > 0) {
      const timeout = setTimeout(() => {
        setRetryAfter(0);
        getCurrentSong();
        getQueue();
      }, retryAfter);

      return () => clearTimeout(timeout);
    }
  }, [retryAfter]);

  useEffect(() => {
    getRoomDetails();

    const interval2 = setInterval(() => {
      getRoomDetails();
    }, 2000);

    return () => clearInterval(interval2);
  }, []);

  const getRoomDetails = () => {
    fetch("/api/get-room" + "?code=" + roomCode)
      .then((response) => {
        if (!response.ok) {
          leaveRoomCallback();
          navigate("/");
        }
        return response.json();
      })
      .then((data) => {
        setVotesToSkip(data.votes_to_skip);
        setVotesToSuggestSong(data.votes_to_suggest_song)
        setGuestCanPause(data.guest_can_pause);
        setIsHost(data.is_host);
        setSuggestedSongs(data.suggested_songs)
        console.log(data.suggestedSongs)
        if (data.is_host) {
          authenticateSpotify();
        }
      });
  };

  const authenticateSpotify = () => {
    fetch("/spotify/is-authenticated")
      .then((response) => response.json())
      .then((data) => {
        setIsAuthenticated(data.status);
        if (!data.status) {
          fetch("/spotify/get-auth-url")
            .then((response) => response.json())
            .then((data) => {
              window.location.replace(data.url);
            });
        }
      });
  };

  const getCurrentSong = () => {
    fetch("/spotify/current-song")
      .then((response) => {
        if (response.status == 401) {
          authenticateSpotify();
          console.log("401");
        } else if (response.status == 429) {
          console.log("429");
          setRetryAfter(response.headers["retry-after"]);
        } else if (response.status == 406) {
          console.log("Unknown Error occured");
        } else if (response.status == 500) {
          setRetryAfter(2000);
        } else {
          console.log("200");
          return response.json();
        }
      })
      .then((data) => {
        setSong(data);
        console.log(data)
      });
  };

  const getQueue = () => {
    fetch("/spotify/get-queue")
      .then((response) => response.json())
      .then((data) => setQueue(data));
  };

  const renderLeaveButton = () => {
    return (
      <Button color="secondary" variant="contained" onClick={handleLeaveButton}>
        Leave Room
      </Button>
    );
  };

  const handleLeaveButton = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/api/leave-room", requestOptions).then((_response) => {
      leaveRoomCallback();
      navigate("/");
    });
  };

  const renderSettings = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <CreateRoomPage
            update={true}
            votesToSkip={votesToSkip}
            votesToSuggestSong={votesToSuggestSong}
            guestCanPause={guestCanPause}
            roomCode={roomCode}
            updateCallback={getRoomDetails}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            color="secondary"
            variant="contained"
            onClick={() => setShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  };

  const renderSettingsButton = () => {
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowSettings(true)}
      >
        Settings
      </Button>
    );
  };

  if (showSettings) {
    return renderSettings();
  } else {
    return (
      <Box spacing={1}>
        <NavBar
          settingsCallback={renderSettings}
          settingsButtonCallback={renderSettingsButton}
          leaveButton={renderLeaveButton}
          host={isHost}
          room_code={roomCode}
        />
        <Grid container sx={{bgcolor: '#F4EDEB'}}>
          <Grid item xs={6}>
            <Box 
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="center"
              p={1}
            >
              <MusicPlayer {...song} />
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="center"
              pr={1}
              pl={1}
            >
              <MusicQueue queue={queue}/>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="center"
              style={{ height: "100%" }}
              p={1}
            >
              <MusicSearch {...song} votes_to_suggest={votesToSuggestSong} suggestedSongs={suggestedSongs} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  }
};

export default Room;
