
import { DB } from "../config/db.config.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

DB.connectPrismaToDB()
    .then(() => {
        console.log("✅ Database connected success");


        app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
    })
    .catch((error) => {
        console.error("Failed to start server due to DB connection error:", error);
    });
