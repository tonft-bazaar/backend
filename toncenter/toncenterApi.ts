import axios from 'axios';

export const getRecentTransactions = async (address: string) => {
    const response = await axios.get(process.env.TONCENTER_API_URL + 'getTransactions', {
        params: {
            'address': address,
            'limit': '100',
            'to_lt': '0',
            'archival': 'false',
            'api_key': process.env.TONCENTER_API_KEY
        },
        headers: {
            'accept': 'application/json'
        }
    });

    if (!response.data.ok) {
        return [];
    }

    return response.data.result;
}



export async function isNftTransfered(contractAddress: string, nftItemAddress: string) {
    const transactions = await getRecentTransactions(contractAddress);

    const transfered = transactions.filter((transaction: any) => {
        return transaction.in_msg.source === nftItemAddress;
    });

    return transfered.length > 0;
}
