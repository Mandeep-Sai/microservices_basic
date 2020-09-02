const express = require("express");
const fileRoutes = require("./routes/files");
const fetch = require("node-fetch");
require("dotenv").config();
const app = express();
app.use("/files", fileRoutes);

app.listen(process.argv[2], async () => {
  console.log(`Running on port ${process.argv[2]}`);
  const registration = await fetch("http://localhost:3001/addMicroservice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: "http://localhost:" + process.argv[2],
    }),
  });

  if (registration.ok) {
    console.log("OK! I'm in");
  } else {
    console.log("SOMETHING WENT WRONG!");
  }
});
