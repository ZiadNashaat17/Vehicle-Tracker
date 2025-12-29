#!/bin/bash
# To run this file open the terminal from the project folder and type: bash setupApp.sh

echo "========================================="
echo "Vehicle Tracker - Installing Dependencies"
echo "========================================="

# Install dependencies for all services
echo ""
echo "Installing dependencies for api-gateway..."
cd api-gateway && npm install && cd ..

echo ""
echo "Installing dependencies for user service..."
cd user && npm install && cd ..

echo ""
echo "Installing dependencies for publisher service..."
cd publisher && npm install && cd ..

echo ""
echo "Installing dependencies for chat service..."
cd chat && npm install && cd ..

echo ""
echo "========================================="
echo "All dependencies installed successfully!"
echo "========================================="
echo ""
echo "You can now start all services by running:"
echo "bash startApp.sh"
echo "========================================="
