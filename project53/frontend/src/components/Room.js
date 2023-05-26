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
import NavBar from "./NavBar";

const Room = ({ leaveRoomCallback }) => {
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [song, setSong] = useState({});

  const { roomCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getRoomDetails();
    getCurrentSong();
  });

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
        setGuestCanPause(data.guest_can_pause);
        setIsHost(data.is_host);
      });
    if (isHost) {
      authenticateSpotify();
    }
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
        if (!response.ok) {
          return {};
        } else {
          return response.json();
        }
      })
      .then((data) => setSong(data));
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
      <Box spacing={1} style={{ width: "100%", height: "100%" }}>
        <NavBar
          settingsCallback={renderSettings}
          settingsButtonCallback={renderSettingsButton}
          leaveButton={renderLeaveButton}
          host={isHost}
          room_code={roomCode}
        />
        <Grid container style={{ height: "100%" }}>
          <Grid item xs={6}>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="center"
              style={{ height: "100%" }}
              p={3}
            >
              {console.log(song)}
              <MusicPlayer {...song} />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="center"
              style={{ height: "100%" }}
              p={3}
            >
              <MusicSearch/>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  }
};

export default Room;
