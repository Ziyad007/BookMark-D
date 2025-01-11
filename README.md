# BookMark-D
## Book Review Website
BookMark'D is a simple web application built with Express.js, PostgreSQL, and EJS that allows users to add their own books and share reviews. Users can submit a book title, description, ISBN, rating, and review, and manage their entries by editing and deleting them. The site also includes sorting and searching functionality to view books based on various criteria.

## Install Dependencies
Before running the app, you need to install the required dependencies. Run the following command:
```
npm install
```
This will install all the necessary packages defined in the package.json file.

### Set Up Environment Variables
You need to set up your database and configure the app. Create a .env file in the root of the project directory and add the following lines:
```
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
PORT=3000
```
Replace the placeholders with your actual database credentials.

### Set Up Database
Before starting the app, you'll need to create the database and tables. You can run the following SQL script to set up the necessary structure for storing book data:
```
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  isbn VARCHAR(13),
  rating FLOAT,
  review TEXT
);
```
### Run the App
Run the following command:
```
node index.js
```
The app will start, and you should see a message like this in your terminal:
```
Listening to port 3000
http://localhost:3000
```
