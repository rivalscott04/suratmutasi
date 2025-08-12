#!/bin/bash

echo "============================================"
echo "    SETUP COMPLETE DATABASE - AMUT"
echo "============================================"
echo ""
echo "Warning: This will reset/update your database!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read -r

cd backend
echo "Running complete database setup..."
npm run ts-node src/scripts/setup-complete.ts

echo ""
echo "============================================"
echo "Setup completed! You can now run the app."
echo "============================================"
