import * as dotenv from 'dotenv'
dotenv.config()

import express from "express";
import http from "http";
import apiRouter from "./router";
import { logger } from "./logging";
import { createSaleLink } from '../tonkeeper/tonkeeperLinks';


const router = express();

/** Server Handling */
const httpServer = http.createServer(router);

/** Log the request */
router.use((req, res, next) => {
  logger.info(`METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

  res.on("finish", () => {
    logger.info(`METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
  });

  next();
});


/** Parse the body of the request */
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

/** Rules of our API */
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method == "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }

  next();
});

/** Routes */
router.use("/apiv1", apiRouter);

/** Error handling */
router.use((req, res, next) => {
  const error = new Error("Not found");

  res.status(404).json({
    message: error.message,
  });
});

/** Listen */
httpServer.listen(2281, () => logger.info(`Server is running 127.0.0.1:${2281}`));
