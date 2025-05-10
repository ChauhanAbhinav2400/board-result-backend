require("dotenv").config();
const cluster = require("cluster");
const os = require("os");
const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { createClient } = require("redis"); // FIX: use require, not import
const Result = require("./models/result");

const app = express(); // FIX: moved before app.use(cors())

app.use(cors());

const PORT = process.env.PORT || 2000;

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb+srv://caaryan877:Radharani%40123@challenge2solution.95o30.mongodb.net/board-results"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Redis Client Setup

app.use((req, res, next) => {
  console.log(`Request received from: ${req.ip}`);
  next();
});

const redisClient = createClient({
  username: "default",
  password: "NKE96XG2Mgv7DALa9Ylq1Cy8y9jkV23l",
  socket: {
    host: "redis-19056.crce179.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 19056,
  },
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

redisClient.connect().then(() => {
  if (cluster.isPrimary || cluster.isMaster) {
    const numCPUs = os.cpus().length;
    console.log(`Master PID: ${process.pid}`);
    for (let i = 0; i < numCPUs; i++) cluster.fork();
  } else {
    // Rate Limiter: 10 requests/min
    const limiter = rateLimit({
      windowMs: 60 * 1000,
      max: 10000,
      message: "Too many requests, please try again later.",
      standardHeaders: true,
      legacyHeaders: false,
    });

    app.use(limiter);

    app.get("/result/:roll", async (req, res) => {
      const roll = req.params.roll;

      try {
        const cached = await redisClient.get(`result:${roll}`);
        if (!cached) {
          console.log("Cache miss");
        } else {
          console.log("Cache hit");
        }
        if (cached) return res.json(JSON.parse(cached));

        const result = await Result.findOne({ rollNumber: roll }).lean();
        if (!result)
          return res.status(404).json({ message: "Result not found" });

        await redisClient.set(`result:${roll}`, JSON.stringify(result), {
          EX: 3600, // 1 hour
        });

        res.json(result);
      } catch (err) {
        console.error("Error fetching result:", err);
        res.status(500).json({ error: "Server error" });
      }
    });

    app.listen(PORT, () =>
      console.log(`Worker ${process.pid} started on port ${PORT}`)
    );
  }
});
