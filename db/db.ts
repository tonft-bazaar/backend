import { Client } from 'pg';

const DATABASE_CONFIG = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number.parseInt(process.env.DB_PORT!),
}

// function that creates table users which contains id, address and current date    
const createTable = async () => {
    const client = new Client(DATABASE_CONFIG);

    await client.connect();
    await client.query(`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        address VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await client.end();
}

// function that creates table with orders which contains id, contractAddress, nftItemAddress, ownerAddress, createdAt, price, status and current date
const createOrdersTable = async () => {
    const client = new Client(DATABASE_CONFIG);

    await client.connect();
    await client.query(`CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        contractAddress VARCHAR(100) NOT NULL,
        nftItemAddress VARCHAR(100) NOT NULL,
        ownerAddress VARCHAR(100) NOT NULL,
        createdAt VARCHAR(100) NOT NULL,
        price VARCHAR(100) NOT NULL,
        status VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await client.end();
}

// get all active orders 
export const getAllActiveOrders = async () => {
    const client = new Client(DATABASE_CONFIG);

    await client.connect();

    const { rows } = await client.query(`SELECT * FROM orders WHERE status = 'active'`);

    await client.end();

    return rows;

}

// get all active orders for nftItemAddress and ownerAddress
export const getActiveOrders = async (nftItemAddress: string, ownerAddress: string) => {
    const client = new Client(DATABASE_CONFIG);

    await client.connect();

    const { rows } = await client.query(`SELECT * FROM orders WHERE nftItemAddress = '${nftItemAddress}' AND ownerAddress = '${ownerAddress}' AND status = 'active'`);

    await client.end();

    return rows;

}

// delete all data from orders table
export const deleteAllOrders = async () => {
    const client = new Client(DATABASE_CONFIG);

    await client.connect();

    await client.query(`DELETE FROM orders`);

    await client.end();

}





// function that inserts data into orders table if does not exist
export const insertIntoOrdersTable = async (contractAddress: string, nftItemAddress: string, ownerAddress: string, createdAt: string, price: string, status: string) => {
    const client = new Client(DATABASE_CONFIG);

    await client.connect();

    const { rows } = await client.query(`SELECT * FROM orders WHERE contractAddress = '${contractAddress}' AND nftItemAddress = '${nftItemAddress}' AND ownerAddress = '${ownerAddress}' AND createdAt = '${createdAt}'`);

    if (rows.length === 0) {
        await client.query(`INSERT INTO orders (contractAddress, nftItemAddress, ownerAddress, createdAt, price, status) VALUES ('${contractAddress}', '${nftItemAddress}', '${ownerAddress}', '${createdAt}', '${price}', '${status}')`);
    }

    await client.end();

}

// function that changes status of order in orders table by nft address
export const changeStatusOfOrder = async (nftItemAddress: string, status: string) => {
    const client = new Client(DATABASE_CONFIG);

    await client.connect();

    await client.query(`UPDATE orders SET status = '${status}' WHERE nftItemAddress = '${nftItemAddress}'`);

    await client.end();

}

createTable();
createOrdersTable();