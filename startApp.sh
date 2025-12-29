#!/bin/bash
# To run this file open the terminal from the project folder and type: bash startApp.sh


echo "========================================="
echo "Vehicle Tracker - Starting All Services"
echo "========================================="

# Start all services in background
echo ""
echo "Starting user service on port 3000..."
(cd user && npm run start:dev) &
USER_PID=$!

echo "Starting publisher service on port 3001..."
(cd publisher && npm run start:dev) &
PUBLISHER_PID=$!

echo "Starting chat service on port 3002..."
(cd chat && npm run start:dev) &
CHAT_PID=$!

echo "Starting api-gateway on port 5000..."
(cd api-gateway && npm run start:dev) &
GATEWAY_PID=$!

echo ""
echo "========================================="
echo "All services started!"
echo "========================================="
echo "User Service PID: $USER_PID"
echo "Publisher Service PID: $PUBLISHER_PID"
echo "Consumer Service PID: $CHAT_PID"
echo "API Gateway PID: $GATEWAY_PID"
echo ""
echo "To stop all services, run:"
echo "kill $USER_PID $PUBLISHER_PID $CHAT_PID $GATEWAY_PID"
echo "========================================="

# Keep script running
wait