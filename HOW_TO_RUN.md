# How to Run LegalMitra-AI

Follow these steps to run the complete project on your local machine.

## 1. Prerequisites
Make sure you have the following installed to your computer:
* **Node.js** (v18 or newer recommended)
* **MongoDB** (You can use a local database or a free cluster on MongoDB Atlas)
* **Git** 

## 2. Setting Up Environment Variables
We use `.env` files to store confidential tokens and database URLs locally so they do not get uploaded to Github.

1. Navigate to the root directory `LegalMitra-AI`.
2. Look for the `.env.example` file. 
3. Create a copy of it and rename the copy to exactly `.env`.
4. Open `.env` and fill in your variables. At a minimum, you'll need:
   - `MONGODB_URI`: Your mongo connection string (e.g., `mongodb://localhost:27017/legalmitra` or the one from MongoDB Atlas)
   - `PORT`: (Default is `5000`)
   - `API_KEY`: Depending on which API service you use for the AI features.

*(Rest of the configuration values can usually be left as default for local development).*

## 3. Installing Dependencies
This project has two parts: Frontend and Backend. You must install dependencies for both.

**Open a terminal at the root of the project:**
```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## 4. Starting the Application

You need two separate terminal windows or tabs to run the backend and frontend at the same time.

**Terminal 1: Start the Backend server**
```bash
cd backend
npm run dev
```
*The backend should default to `http://localhost:5000`*

**Terminal 2: Start the Frontend React App**
```bash
cd frontend
npm run dev
```
*The frontend should default to `http://localhost:5173`*

Open your browser to the Frontend URL given by Vite (usually localhost:5173), and the project should be properly working!
