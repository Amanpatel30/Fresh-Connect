#!/bin/bash
echo "Running database seeder..."
cd backend
npm run seed $1
echo "Seeding complete!" 