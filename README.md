# About

Welcome to House-Party!!

This app was made to allow a group of friends, or a party gathering to collectively be in charge of the music. A host can make a room and let other people join by distributing a room code. The users can view the song playing and the queue, as well as control the music by voting for songs that they wish to add to queue. If a song gets a certain number of votes in a given time period, then the song gets added to queue. This app makes use of the Spotify API, but it is important to note that the host requires a Spotify Premium account for the features to work properly (things like skipping and adding to queue are premium features).

## Installation

First, install the required dependencies by running `npm i` in the **/frontend** directory. 

This project is designed to run in Docker, since it uses Celery which isn't compatible with windows anymore. You can run `docker compose docker-compose.yml up` to run this project in Docker.

## Inspiration and Credit
