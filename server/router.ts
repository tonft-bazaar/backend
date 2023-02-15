import * as express from "express";
import controller from "./controller";

const router = express.Router();

router.get("/getUserNfts", controller.getUserNfts)

router.get("/getAllOffers", controller.getAllOffers);
router.get("/getOffer", controller.getOffer);

router.get("/getInitLink", controller.getInitLink);
router.get("/checkInit", controller.checkInit);

router.get("/getTransferLink", controller.getTransferLink);
router.get("/checkTransfer", controller.checkTransfer);
router.get("/getConfig", controller.getConfig)

router.get("/getCancelLink", controller.getCancelLink);

router.get("/getBuyLink", controller.getBuyLink)


export = router;
