# MongoDB Setup Guide

This project requires MongoDB to be installed and running for full functionality. If you're experiencing database connection errors, follow these steps to set up MongoDB.

## Installing MongoDB on Windows

1. **Download MongoDB Community Server**:
   - Go to the [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Select the latest version, Windows, and MSI package
   - Download the installer

2. **Run the installer**:
   - Follow the installation wizard
   - Choose "Complete" installation
   - Install MongoDB as a service (recommended)
   - Install MongoDB Compass (optional but useful GUI)

3. **Verify installation**:
   - Open Command Prompt
   - Run `mongod --version` to check if MongoDB is installed
   - If successful, you should see the MongoDB version

## Starting MongoDB

### If installed as a service:
MongoDB should start automatically with Windows. To check if it's running:
1. Open Services (Press Win+R, type `services.msc`, press Enter)
2. Look for "MongoDB Server" in the list
3. Make sure its status is "Running"

### If not installed as a service:
1. Create a data directory: `mkdir -p C:\data\db`
2. Start MongoDB server: `mongod --dbpath C:\data\db`

## Testing the Connection

1. Open another Command Prompt
2. Run `mongo` to connect to the MongoDB shell
3. If you can connect, MongoDB is running correctly

## Troubleshooting

### Port 27017 already in use
If MongoDB can't start because port 27017 is in use:
1. Find the process using the port: `netstat -ano | findstr :27017`
2. Note the PID (last number)
3. Kill the process: `taskkill /F /PID <PID>`
4. Try starting MongoDB again

### Connection refused
If your application can't connect to MongoDB:
1. Make sure MongoDB is running
2. Check your connection string (should be `mongodb://127.0.0.1:27017/major-project`)
3. Ensure no firewall is blocking the connection

## Using MongoDB Compass

MongoDB Compass is a GUI for MongoDB that makes it easier to view and manage your data:
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. You should see your databases, including `major-project`

## Running the Application Without MongoDB

The application has been updated to work even without a MongoDB connection, using mock data. However, for full functionality (saving data, user authentication, etc.), MongoDB is required. 