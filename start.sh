#!/bin/bash

# Install dependencies
npm install

# Build the frontend app
npm run build

# Serve the build folder as a static site
npx serve -s build
