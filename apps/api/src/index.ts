import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(healthRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3001;

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
