import express from 'express';
import cors from "cors";
import { codeQueue } from './queue.js';

const app = express();
app.use(express.json());
app.use(cors());
// Submit code
app.post("/run", async (req, res) => {
  const { language, code } = req.body;
  if (!language || !code) return res.status(400).json({ error: "Missing language or code" });

  const job = await codeQueue.add('codeJob', { language, code });
  res.json({ jobId: job.id, status: "queued" });
});

// Check job status
app.get("/status/:id", async (req, res) => {
  const job = await codeQueue.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });

  const state = await job.getState();
  const result = job.returnvalue || null;
  res.json({ jobId: job.id, state, result });
});

app.listen(3000, () => console.log("Backend running on http://localhost:3000"));
