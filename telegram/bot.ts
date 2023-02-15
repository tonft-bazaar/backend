import { Telegraf } from 'telegraf';
import axios from 'axios';

import fs from 'fs';

const BASE_URL = process.env.BASE_URL;
const IMAGE_PATH = process.env.BOT_IMAGE_PATH;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const bot = new Telegraf(BOT_TOKEN!);


export const round = (value: number, precision: number): number => {
  return Math.round(10 ** precision * value) / 10 ** precision;
};

async function getNftInfo(nftAddress: string) {
  const request = await axios.get(`https://tonapi.io/v1/nft/getItems?addresses=${nftAddress}`)
  console.log(request.data)

  const collectionName = request.data.nft_items[0].collection.name;
  const itemName = request.data.nft_items[0].metadata.name;
  const itemDescription = request.data.nft_items[0].metadata.description;

  const imageUrl = request.data.nft_items[0].metadata.attributes.image;

  return { collectionName, itemName, itemDescription, imageUrl };
}

export function createMessageText(
  contractAddress: string,
  nftAddress: string,
  salePrice: string,
  ownerAddress: string,
  itemInfo: any
) {
  const { collectionName, itemName, itemDescription, imageUrl } = itemInfo;
  const encryptedData = encodeURI(JSON.stringify({ nftAddress, walletAddress: ownerAddress, salePrice, contractAddress: contractAddress }));

  const link = 'https://tonft.app/getOffer?owner=' + ownerAddress + '&nftItem=' + nftAddress;

  console.log(link)

  return `<b>🔖 <a href="${imageUrl}">New offer</a></b>

<b>Item:</b> ${itemName}

<b>Collection:</b> ${collectionName}

<b>Description:</b> ${itemDescription}

<a href="https://tonscan.org/address/${nftAddress}">NFT</a> | <a href="https://tonscan.org/address/${contractAddress}">Sale contract</a> 
Sale price: <a>${round(Number.parseFloat(salePrice), 2)}</a> 💎

<a href="${link}"><b>Buy now</b></a>`;
}

export async function sendMessageToChannel(contractAddress: string, nftAddress: string, salePrice: string, ownerAddress: string) {
  try {
    const itemInfo = await getNftInfo(nftAddress);

    bot.telegram.sendMessage(CHANNEL_ID!, createMessageText(contractAddress, nftAddress, salePrice, ownerAddress, itemInfo), { parse_mode: 'HTML' });

  } catch {

  }
}
