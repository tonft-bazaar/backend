import axios from "axios";
import axiosThrottle from "axios-request-throttle";
axiosThrottle.use(axios, { requestsPerSecond: 0.5 });

import { Address, toNano } from "ton";
import base64url from "base64url";
import BN from "bn.js";

const MARKETPLACE_FEE = process.env.MARKETPLACE_FEE;
const MARKETPLACE_ADDRESS = process.env.MARKETPLACE_ADDRESS;
const ROYALTY_ADDRESS = process.env.ROYALTY_ADDRESS;
const TONKEEPER_TXREQUEST_URL = process.env.TONKEEPER_TXREQUEST_URL;

export function createBuyLink(saleContractAddress: string, fullPrice: string) {
    const floatPrice = (parseFloat(fullPrice) + 1).toFixed(3);

    const validTx = {
        version: "0",
        body: {
            type: "sign-raw-payload",
            params: {
                messages: [
                    {
                        address: saleContractAddress,
                        amount: toNano(floatPrice),
                    }
                ]
            },
        },
    };

    const host = TONKEEPER_TXREQUEST_URL;
    const buff = Buffer.from(JSON.stringify(validTx));
    return host + base64url(buff);
}

export function createSaleLink(nftItemAddress: string, fullPrice: BN) {
    const validTx = {
        version: "0",
        body: {
            type: "nft-sale-place",
            params: {
                marketplaceAddress: MARKETPLACE_ADDRESS, // (string): address of the marketplace
                marketplaceFee: toNano(MARKETPLACE_FEE!), // (integer): nanocoins as marketplace fee
                royaltyAddress: ROYALTY_ADDRESS, // (string): address for the royalties
                nftItemAddress: nftItemAddress, // (string): identifier of the specific nft item
                royaltyAmount: toNano(0), // (integer): nanotoncoins sent as royalties
                fullPrice: fullPrice, // (integer): price in nanocoins
                amount: toNano(0.05), //(integer): nanotoncoins sent as commission with the message
            },
        },
    };

    const host = TONKEEPER_TXREQUEST_URL;
    const buff = Buffer.from(JSON.stringify(validTx));

    return host + base64url(buff);
}

export function createCancelLink(ownerAddress: string, saleContractAddress: string) {
    const validTx = {
        version: "0",
        body: {
            type: "nft-sale-cancel",
            params: {
                saleAddress: saleContractAddress,
                ownerAddress: ownerAddress,
                amount: `${toNano(1)}`
            },
        },
    };

    const host = TONKEEPER_TXREQUEST_URL;
    const buff = Buffer.from(JSON.stringify(validTx));

    return host + base64url(buff);
}


export function createTransferLink(newOwnerAddress: string, nftItemAddress: string) {
    const validTx = {
        version: "0",
        body: {
            type: "nft-transfer",
            params: {
                newOwnerAddress: newOwnerAddress,
                nftItemAddress: nftItemAddress,
                amount: `${toNano(0.1)}`,
                forwardAmount: `${toNano(0.02)}`,
                text: "NFT transfer",
            },
        },
    };

    const host = TONKEEPER_TXREQUEST_URL;
    const buff = Buffer.from(JSON.stringify(validTx));

    return host + base64url(buff);
}