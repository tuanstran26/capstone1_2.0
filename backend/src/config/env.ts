import dotenv from "dotenv";

dotenv.config();

const DEFAULT_PORT = 5000;
const DEFAULT_FRONTEND_URL = "http://localhost:3000";
const DEFAULT_MONGO_URI = "mongodb://localhost:27017/fitness_studio";
const DEFAULT_SESSION_SECRET = "supersecret";

export const env = {
  port: Number(process.env.PORT) || DEFAULT_PORT,
  frontendUrl: process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL,
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI || DEFAULT_MONGO_URI,
  sessionSecret: process.env.SESSION_SECRET || DEFAULT_SESSION_SECRET,
  isProduction: process.env.NODE_ENV === "production",
};
