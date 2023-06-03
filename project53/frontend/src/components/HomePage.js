import React, { useState, useEffect } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
import { Grid, Button, ButtonGroup, Typography, Box } from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  Link,
  Navigate,
} from "react-router-dom";

const HomePage = () => {
  const [roomCode, setRoomCode] = useState(null);

  useEffect(() => {
    const fecthData = async () => {
      fetch("/api/user-in-room")
        .then((response) => response.json())
        .then((data) => {
          setRoomCode(data.code);
        });
    };
    fecthData();
  });

  const clearRoomCode = () => {
    setRoomCode(null);
  };

  const renderHomePage = () => {
    return (
      <Grid container spacing={3} sx={{ height: "100vh" }}>
        <Grid
          item
          xs={12}
          align="center"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h3" compact="h3">
            House Party
          </Typography>
        </Grid>
        <Grid
          item
          display="flex"
          align="center"
          alignItems="center"
          justifyContent="center"
        >
          <Box width="50%" textAlign="center">
            <Typography variant="h6" compact="h6">
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum."
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} align="center">
          <ButtonGroup disableElevation variant="contained" color="primary">
            <Button color="primary" to="/join" component={Link}>
              Join a Room
            </Button>
            <Button color="secondary" to="/create" component={Link}>
              Create a Room
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/join" element={<RoomJoinPage />} />
        <Route path="/create" element={<CreateRoomPage />} />
        <Route
          exact
          path="/"
          element={
            roomCode ? <Navigate to={`/room/${roomCode}`} /> : renderHomePage()
          }
        />
        <Route
          path="/room/:roomCode"
          element={<Room leaveRoomCallback={clearRoomCode} />}
        />
      </Routes>
    </Router>
  );
};

export default HomePage;
