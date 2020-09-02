const express = require("express");
const fs = require("fs-extra");
const cors = require("cors");

const server = express();
const file = "micros.json";

server.use(cors());
server.use(express.json());

server.post("/addMicroservice", async (req, res) => {
  const nodes = JSON.parse(await fs.readFile("micros.json"));
  console.log(nodes);
  if (!nodes.find((n) => n === req.body.url)) {
    nodes.push(req.body.url);
    await fs.writeFile("micros.json", JSON.stringify(nodes));
  }
  res.send("done");
});

server.get("/:containerName", async (req, res) => {
  let result = 10;
  do {
    //read the list
    const nodes = JSON.parse(await fs.readFile("micros.json"));
    console.log("nodes", nodes);
    if (nodes.length === 0)
      //if no nodes available => error
      return res.status(500).send("No available workers");

    //take a random node from the list
    const randomService = Math.floor(Math.random() * nodes.length);
    const node = nodes[randomService];
    console.log("Contacting node " + node);
    const url = node + "/files/" + req.params.containerName;
    try {
      const response = await fetch(url); // sending the request to the microservice
      if (response.ok) {
        const files = await response.json();
        return res.send(files);
      } else {
        const removed = nodes.filter((x) => x !== node); //removing current node from nodelist
        await fs.writeFile(file, JSON.stringify(removed));
        console.log(`Removing ${node} from the list!`);
      }
    } catch {
      // if the microservice is dead, remove it from the list
      const removed = nodes.filter((x) => x !== node); //removing current node from nodelist
      await fs.writeFile(file, JSON.stringify(removed));
      console.log(`Removing ${node} from the list!`);
      result--;
    }
  } while (result > 0);
});

server.listen(3001, () => {
  console.log("running on 3001");
});
