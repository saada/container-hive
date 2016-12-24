# Docker Hive

![Screenshot](public/images/squares.gif)

## Why

Visualization helps provides intuition and understanding. This project tries to answer the question

    What am I running on my environment?

## What

Docker GUI's main goal is to give a user friendly display of everything that is running in your Docker daemon and, in the future, provide powerful CRUD capabilities. 

## How

Docker GUI is a Node app built with React, µWS, execa, Dockerode, and Express.

## Try it out!

### Setup Sysdig on your platform

#### Docker for Mac

Follow the [mobydig guide](https://github.com/fdebonneval/mobydig) to compile sysdig for Docker for Mac. This app takes care of spinning up the container for you. You follow the official sysdig issue [here](https://github.com/draios/sysdig/issues/637)

#### Other platforms

Coming really soon!

### Setup backend and frontend

```bash
npm install
npm run start-server
npm run start
```

Your browser should open a new tab with the app loaded on http://localhost:8000

## UI Concept

![Concept](public/images/ComponentConcept.png)

## Screenshots (WIP)

![Screenshot](public/images/ScreenShot2016-08-13-10.53.33AM.png)

![Screenshot](public/images/network_request.gif)

## Contibuting

```bash
# Start React App with Hot Reloading
npm run start

# Start Backend App
npm run start-server
```

Pull Requests are welcomed and encouraged!

## Known Issues

* Running containers in detached mode is not possible unless the container has an entrypoint