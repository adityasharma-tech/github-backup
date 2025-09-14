import morgan from "morgan";
import cors from "cors"
import express from "express"
import { config as loadEnv } from "dotenv"
import cookieParser from "cookie-parser";

loadEnv({
    debug: true,
    path: "./.env"
})

const app = express();

// middlewares
app.use(express.json())
app.use(express.urlencoded())
app.use(cors({
    origin: ['http://localhost:5473', 'http://localhost:5173'],
    methods: ["POST", "GET", "OPTIONS"],
    credentials: true
}))
app.use(cookieParser())
app.use(morgan("combined"))

// router imports
import callbackRouter from "./routes/callback.route";
import router from "./routes/app.route";

app.use("/api/_callback", callbackRouter)
app.use('/api', router)

export default app;