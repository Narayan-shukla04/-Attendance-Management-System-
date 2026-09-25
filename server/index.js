import dotenv from "dotenv";
import app from "./src/app/app.js";
import { connectDB } from "./src/config/database.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB()


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});