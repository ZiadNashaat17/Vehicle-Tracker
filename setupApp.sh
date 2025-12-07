#!/bin/bash

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
echo "Installing dependencies for consumer service..."
cd consumer && npm install && cd ..

echo ""
echo "========================================="
echo "All dependencies installed successfully!"
echo "========================================="
echo ""
echo "You can now start all services by running:"
echo "bash startApp.sh"
echo "========================================="
