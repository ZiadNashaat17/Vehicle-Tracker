echo "========================================="
echo "Vehicle Tracker - Formatting Services"
echo "========================================="

echo ""
echo "Formatting api-gateway..."
cd api-gateway && npm run format && cd ..

echo ""
echo "Formatting user service..."
cd user && npm run format && cd ..

echo ""
echo "Formatting publisher service..."
cd publisher && npm run format && cd ..


echo ""
echo "========================================="
echo "All Services are formatted successfully!"
echo "========================================="

