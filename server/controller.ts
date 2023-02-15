import { NextFunction, Request, Response } from "express";
import { createCancelLink, createTransferLink, createSaleLink, createBuyLink } from "../tonkeeper/tonkeeperLinks";
import { sendMessageToChannel } from "../telegram/bot";

import { toNano, Address } from "ton";
import { isNftTransfered } from "../toncenter/toncenterApi";
import { getContractAddress } from "../utils/utils";
import { getNftItems, getNftsByUserAddress } from "../tonapi/tonapiApi";
import { changeStatusOfOrder, deleteAllOrders, getActiveOrders, getAllActiveOrders, insertIntoOrdersTable } from "../db/db";

const getAllOffers = async (req: Request, res: Response, next: NextFunction) => {
  // try {
  let activeOrders = await getAllActiveOrders();

  if (activeOrders.length === 0) {
    return res.status(200).json({
      message: "No active orders",
    });
  }
  let itemsData = await getNftItems(activeOrders.map((order) => order.nftitemaddress).join(","));

  const notActiveOrders = itemsData.filter((item: any) => !item.sale);

  if (notActiveOrders.length > 0) {
    notActiveOrders.forEach((order: any) => {
      const address = Address.parseRaw(order.address).toFriendly();
      changeStatusOfOrder(address, "not active");
    });
  }

  const unifiedData = activeOrders.map((order, index) => {
    const item = itemsData.find((item: any) => {
      const address = Address.parseRaw(item.address).toFriendly();
      return address === order.nftitemaddress
    }
    );
    return {
      ...order,
      ...item,
    };

  });

  const unifiedDataWIthoutNotActive = unifiedData.filter((order) => order.sale);

  return res.status(200).json({
    activeOrders: unifiedDataWIthoutNotActive
  });

  // } catch (error) {
  //   return res.status(500).json({
  //     message: "Something HUJ went wrong",
  //   });
  // }
};

const getOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const nftItemAddress = req.query.nftItemAddress;
    const ownerAddress = req.query.ownerAddress;


    if (!nftItemAddress) {
      return res.status(400).json({
        message: "nftItemAddress is required",
      });
    }

    if (!ownerAddress) {
      return res.status(400).json({
        message: "ownerAddress is required",
      });
    }


    const nftItemAddressFormated = nftItemAddress.toString();
    const ownerAddressFormated = ownerAddress.toString();
    const activeOrders = await getActiveOrders(nftItemAddressFormated, ownerAddressFormated);

    console.log(activeOrders)



    if (activeOrders.length === 0) {
      return res.status(404).json({
        error: "No active orders",
      });
    }

    const activeOrder = activeOrders[0];
    const cancelLink = createCancelLink(activeOrder.owneraddress, activeOrder.contractaddress);

    const buyLink = createBuyLink(activeOrder.contractaddress, activeOrder.price);

    return res.status(200).json({
      activeOrder,
      cancelLink,
      buyLink
    });


  } catch (error) {

  }
}

const getInitLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nftItemAddress = req.query.nftItemAddress;
    const fullPrice = req.query.fullPrice;

    if (!nftItemAddress) {
      return res.status(400).json({
        message: "contractAddress is required",
      });
    }

    if (!fullPrice) {
      return res.status(400).json({
        message: "fullPrice is required",
      });
    }

    if (isNaN(Number.parseFloat(fullPrice.toString()))) {
      return res.status(400).json({
        message: "fullPrice should be a number",
      });
    }


    const nftItemAddessFormated = nftItemAddress.toString();

    const link = createSaleLink(nftItemAddessFormated, toNano(fullPrice.toString()));

    return res.status(200).json({
      link,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

const checkInit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerAddress = req.query.ownerAddress;
    const createdAt = req.query.createdAt;

    if (!ownerAddress) {
      return res.status(400).json({
        message: "ownerAddress is required",
      });
    }

    if (!createdAt) {
      return res.status(400).json({
        message: "createdAt is required",
      });
    }

    if (isNaN(Number.parseInt(createdAt.toString()))) {
      return res.status(400).json({
        message: "createdAt should be a number",
      });
    }

    const ownerAddressAddress = ownerAddress.toString();
    const createdAtNumber = createdAt.toString();

    const contractAddress = await getContractAddress(ownerAddressAddress, createdAtNumber);

    if (!contractAddress) {
      return res.status(200).json({
        initialized: false,
      });
    }



    return res.status(200).json({
      initialized: true,
      contractAddress,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

const getTransferLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contractAddress = req.query.contractAddress;
    const nftItemAddress = req.query.nftItemAddress;

    if (!contractAddress) {
      return res.status(400).json({
        message: "contractAddress is required",
      });
    }

    if (!nftItemAddress) {
      return res.status(400).json({
        message: "nftItemAddress is required",
      });
    }

    const link = createTransferLink(contractAddress.toString(), nftItemAddress.toString());
    return res.status(200).json({
      link,
    });


  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

const checkTransfer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contractAddress = req.query.contractAddress;
    const nftItemAddress = req.query.nftItemAddress;
    const ownerAddress = req.query.ownerAddress;
    const createdAt = req.query.createdAt;
    const price = req.query.price;


    if (!contractAddress) {
      return res.status(400).json({
        message: "contractAddress is required",
      });
    }

    if (!nftItemAddress) {
      return res.status(400).json({
        message: "nftItemAddress is required",
      });
    }

    const contractAddressFormated = contractAddress.toString();
    const nftItemAddressFormated = nftItemAddress.toString();
    const ownerAddressAddress = ownerAddress!.toString();
    const createdAtNumber = createdAt!.toString();
    const priceNumber = price!.toString();


    const transfered = await isNftTransfered(contractAddressFormated, nftItemAddressFormated);

    if (transfered) {
      insertIntoOrdersTable(contractAddressFormated, nftItemAddressFormated, ownerAddressAddress, createdAtNumber, priceNumber, 'active');
      sendMessageToChannel(contractAddressFormated, nftItemAddressFormated, priceNumber, ownerAddressAddress);
    }

    if (transfered) {
      return res.status(200).json({
        transfered,
      });
    }

    return res.status(200).json({
      transfered,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

const getUserNfts = async (req: Request, res: Response, next: NextFunction) => {
  // try {

  let userAddress = req.query.userAddress;
  console.log(userAddress); ``
  if (!userAddress) {
    return res.status(400).json({
      message: "userAddress is required",
    });
  }

  userAddress = userAddress.toString();

  const nfts = await getNftsByUserAddress(userAddress);

  return res.status(200).json({
    nfts,
  });
  // } catch (error) {
  //   return res.status(500).json({
  //     message: "Something went wrong",
  //     error
  //   });
  // }
}


const getCancelLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerAddress = req.query.ownerAddress;
    const saleContractAddress = req.query.saleContractAddress;

    if (!ownerAddress) {
      return res.status(400).json({
        message: "ownerAddress is required",
      });
    }

    if (!saleContractAddress) {
      return res.status(400).json({
        message: "saleContractAddress is required",
      });
    }

    const ownerAddressFormated = ownerAddress.toString();
    const saleContractAddressFormated = saleContractAddress.toString();


    const cancelLink = createCancelLink(ownerAddressFormated, saleContractAddressFormated)

    return res.status(200).json({
      cancelLink,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

const getConfig = async (req: Request, res: Response, next: NextFunction) => {

  return res.status(200).json(
    {
      "url": "tonft.app",
      "name": "TONFT",
      "iconUrl": "https://telegra.ph/file/c7201eca05a8254d17d0b.png",
    }
  );
}


const getBuyLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const saleContractAddress = req.query.saleContractAddress;
    const fullPrice = req.query.fullPrice;

    if (!fullPrice) {
      return res.status(400).json({
        message: "fullPrice is required",
      });
    }

    if (!saleContractAddress) {
      return res.status(400).json({
        message: "saleContractAddress is required",
      });
    }


    const buyLink = createBuyLink(saleContractAddress.toString(), fullPrice.toString().split('.')[0]);

    return res.status(200).json({
      buyLink,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

export default {
  getAllOffers,
  getOffer,
  getInitLink,
  checkInit,
  getTransferLink,
  checkTransfer,
  getUserNfts,
  getCancelLink,
  getConfig,
  getBuyLink
};

