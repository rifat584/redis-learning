import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { createClient } from "redis";
// import { sendEmail } from "./sendEmail.js";
import { Queue } from "bullmq";
import "./emailWorker.js";

dotenv.config();
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// BullMQ Queue
const emailQueue = new Queue("sendEmail", {
  connection: {
    url: process.env.REDIS_URL,
  },
});

// BullMQ
app.post("/send-email", async (req: Request, res: Response) => {
  // const result = await sendEmail(req.body); // Time consuming, failure prone, No retry option
  const result = await emailQueue.add("emailQueue", req.body, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  });

  res.json({
    status: 201,
    message: "Please check your email for email verification!",
    data: result,
  });
});

// Redis Connection
const redis = createClient({
  url: process.env.REDIS_URL,
});

const connectRedis = async () => {
  await redis.connect();
  console.log("Redis connected");
};
connectRedis();

// Redis
app.post("/", async (req, res) => {
  const bodyData = req.body;
  // String
  await redis.set("name", bodyData);
  await redis.set("otp", 123456, { EX: 30 }); //Set TTL
  const getName = await redis.get("name");
  const getOtp = await redis.get("otp");
  // await redis.del("name");

  // Hash -> Object like data store -> user,product details
  await redis.hSet("product:001", {
    name: "Apple",
    price: 30,
    quantity: 10,
  });

  const productAllField = await redis.hGetAll("product:001"); //get all fields
  const productSingleField = await redis.hGet("product:001", "name"); //get a single field

  // List -> Array like data store -> notifications, job queue
  await redis.lPush("usersId", "user_001");
  await redis.rPush("usersId", "user_002");

  const getList = await redis.lRange("usersId", 0, 1);

  // set -> Stores only unique values -> user roles, tags
  await redis.sAdd("productIds", ["001", "002", "003", "001"]);
  // await redis.sRem("productIds", "003");
  const uniqueProducts = await redis.sMembers("productIds");

  res.json({
    statusCode: 201,
    message: "Welcome to learning redis",
    result: {
      string: { name: getName, OTP: getOtp },
      hash: {
        productDetails: productAllField,
        productSingleValue: productSingleField,
      },
    },
    list: getList,
    set: uniqueProducts,
  });
});

app.listen(PORT, () => {
  console.log("server running on port", PORT);
});
