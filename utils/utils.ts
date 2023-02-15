import { getRecentTransactions } from '../toncenter/toncenterApi';

export const getContractAddress = async (ownerAddress: string, createdAt: string) => {
    const transactions = await getRecentTransactions(process.env.MARKETPLACE_ADDRESS!);
    const unixTime = Number.parseInt(createdAt);
    // const unixTime = Math.ceil((new Date(createdAt).getTime() / 1000)) - 10;

    for (const transaction of transactions) {
        const transactionCreatedTime = Number.parseInt(transaction.utime);
        console.log(transactionCreatedTime, unixTime);
        if (transaction.in_msg?.source === ownerAddress && transactionCreatedTime > unixTime) {
            if (transaction.out_msgs.length === 0) {
                continue;
            }
            return transaction.out_msgs[0].destination;
        }
    }

    return null;
}