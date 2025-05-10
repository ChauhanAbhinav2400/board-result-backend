// seed.js
const mongoose = require("mongoose");
const Result = require("./models/result");

mongoose.connect(
  process.env.MONGO_URI ||
    "mongodb+srv://caaryan877:Radharani%40123@challenge2solution.95o30.mongodb.net/board-results"
);

(async () => {
  const bulkOps = [];
  for (let i = 1; i <= 100000; i++) {
    bulkOps.push({
      insertOne: {
        document: {
          rollNumber: i,
          name: `Student ${i}`,
          class: "10th",
          marks: {
            math: Math.floor(Math.random() * 101),
            physics: Math.floor(Math.random() * 101),
            chemistry: Math.floor(Math.random() * 101),
            hindi: Math.floor(Math.random() * 101),
            english: Math.floor(Math.random() * 101),
          },
        },
      },
    });
  }
  await Result.bulkWrite(bulkOps);
  console.log("Data inserted");
  mongoose.disconnect();
})();
