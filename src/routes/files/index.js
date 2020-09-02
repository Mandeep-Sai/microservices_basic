const express = require("express");
const multer = require("multer");

require("dotenv").config();
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");

const credentials = new StorageSharedKeyCredential(
  "microservices1415",
  process.env.STORAGE_KEY
);

const blobClient = new BlobServiceClient(
  "https://microservices1415.blob.core.windows.net/",
  credentials
);
const MulterAzureStorage = require("multer-azure-storage");
const multerOptions = multer({
  storage: new MulterAzureStorage({
    azureStorageConnectionString: process.env.STORAGE_CS,
    containerName: "images",
    containerSecurity: "container",
  }),
});

const router = express.Router();

router.get("/", async (req, res) => {
  const containers = await blobClient.listContainers();
  const toReturn = [];
  for await (const container of containers) {
    toReturn.push(container.name);
  }
  res.send(toReturn);
});

router.post(
  "/uploadWithMulter",
  multerOptions.single("file"),
  async (req, res) => {
    res.send(req.file.url);
  }
);

router.post("/:containerName", async (req, res) => {
  const container = await blobClient.createContainer(req.params.containerName, {
    access: "container",
  });
  res.send(container);
});

const options = multer({});
router.post(
  "/:containerName/upload",
  options.single("file"),
  async (req, res) => {
    const container = await blobClient.getContainerClient(
      req.params.containerName
    );
    const file = await container.uploadBlockBlob(
      req.file.originalname,
      req.file.buffer,
      req.file.size
    );

    res.send(file);
  }
);

router.get("/:containerName", async (req, res) => {
  const container = await blobClient.getContainerClient(req.params.container);
  const files = await container.listBlobsFlat();
  const toReturn = [];
  for await (const file of files) {
    toReturn.push(file);
  }
  res.send(toReturn);
});

router.delete("/:containerName/:fileName", async (req, res) => {
  const container = await blobClient.getContainerClient(req.params.container);
  await container.deleteBlob(req.params.fileName);

  res.send("deleted");
});

module.exports = router;
