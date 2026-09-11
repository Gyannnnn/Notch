import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health.js";
import authRouter from "./routes/authRoutes/auth.routes.js";
import userRouter from "./routes/userRoutes/user.routes.js";
import { errorHandler } from "./middleware/error/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors());

// Mounted BEFORE express.json(): the Clerk webhook route parses its own body
// with express.raw() (see routes/authRoutes/auth.routes.ts) because Svix
// signs the exact raw bytes — once express.json() has consumed the request
// stream for a matching route, that route can no longer read it raw. Keep
// this router above the express.json() line below.
app.use("/webhooks", authRouter);

app.use(express.json());

app.use("/me", userRouter);
app.use(healthRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

const port = process.env.PORT ? Number(process.env.PORT) : 3001;

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
