import { Worker } from "bullmq";
import { sendEmail } from "./sendEmail.js";
import dotenv from "dotenv";

dotenv.config();
// The Worker -> Pulls job from queue and process
export const emailWorker = new Worker(
  "sendEmail",
  async (job) => {
    console.log("This is Job inside worker:", job);
    await sendEmail(job.data);
  },
  {
    connection: {
      url: process.env.REDIS_URL,
    },
    concurrency: 5,
    removeOnComplete: {
      age: 2,
    },
  },
);

emailWorker.on("completed", (job) => console.log("Job done", job.id, job.name));
emailWorker.on("failed", (job) =>
  console.log("Job failed", job?.id, job?.name),
);
