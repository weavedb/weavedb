require("dotenv").config();
const redishost = process.env.REDISHOST ? process.env.REDISHOST : "localhost" // 'localhost';
const redisport = process.env.REDISPORT ? process.env.REDISPORT : 6379 // 6379;
// const accessKeyId = process.env.AWS_ACCESS_KEY_ID
// const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
// const s3region = process.env.AWS_REGION
// const s3bucket = process.env.S3_BUCKET_NAME
// const s3prefix = process.env.S3_PREFIX
// const wallet = require('./wallet.json')

const EVM_WALLET_ADDRESS =  process.env.EVM_WALLET_ADDRESS;
const EVM_PRIVATE_KEY = Buffer.from( process.env.EVM_PRIVATE_KEY, "hex");

const BUNDLER_EVM_WALLET_ADDRESS =  process.env.BUNDLER_EVM_WALLET_ADDRESS;
const BUNDLER_EVM_PRIVATE_KEY = Buffer.from( process.env.BUNDLER_EVM_PRIVATE_KEY, "hex");


const wallet = {
    getAddressString: () => EVM_WALLET_ADDRESS.toLocaleLowerCase(),
    getPrivateKey: () => EVM_PRIVATE_KEY,
  };
  

const bundler_wallet = {
    getAddressString: () => BUNDLER_EVM_WALLET_ADDRESS.toLocaleLowerCase(),
    getPrivateKey: () => BUNDLER_EVM_PRIVATE_KEY,
};
  
    

module.exports = {
    cache: "redis", 
    cache_prefix: "tel-aviv",
    redis: {
        prefix: "weavedb",
        url: `redis://${redishost}:${redisport}`,
    },

    // snapshot_span: 1000 * 60 * 5, // 5 min 

    // s3: {
    //     bucket: s3bucket,
    //     prefix: s3prefix,
    //     accessKeyId: accessKeyId,
    //     secretAccessKey: secretAccessKey,
    //     region: s3region,
    // },

    // admin: {
    //     //contractTxId: "WEAVEDB_ADMIN_CONTRACT",
    //     contractTxId: 'YSReuO6vzkBWd4Tdfe8HE0YLXj4tJokfatsORv7iZ94',
    //     owner: wallet,
    // },  
    owner: '0x0fa4fe1a58a7815adbc16d74111462661843b83b', // eth
    // owner: wallet,
    //owner: '0x0fa4fe1a58a7815adbc16d74111462661843b83b',// eth
    // owner: '0x0Fa4fE1a58a7815ADBc16D74111462661843B83B', //  eth
    // owner: '0xTbAy2H24tDHD3HMoYkEpTWtk4m4QYhDLQxaHfXJr0', //  arweave
    rollups: {
        // '70uhR8YuJnvMmAEFxIdjdiYtvHiba1VKnWXPZmg4emQ': {
        //     secure: false,
        //     owner: '0xTbAy2H24tDHD3HMoYkEpTWtk4m4QYhDLQxaHfXJr0', // arweave 
        //     dbname: 'testdb0',
            // dir: './_rollups',
        // },
        '7-_p-08gQiD8HbcVK0uYD0SZhh37SGzmKf8JOdipS4g': {
            secure: false,
            owner: '0x0fa4fe1a58a7815adbc16d74111462661843b83b', // eth
            // owner: wallet,
            dbname: 'testdb1',
            rollup: true,
            dir: './_rollups',
            bundler_wallet: bundler_wallet,
            bundler_wallet_type: 'evm',
        },
        // 'J9FheVGK9qCc7j0zqrE0g6v6boHB7EXos3Xc_wfHdXQ': {
        //     secure: false,
        //     owner: '0x0fa4fe1a58a7815adbc16d74111462661843b83b', // eth
        //     // owner: wallet,
        //     //owner: '0x0fa4fe1a58a7815adbc16d74111462661843b83b', // eth 
        //     // owner: '0x0Fa4fE1a58a7815ADBc16D74111462661843B83B', // eth 
        //     //owner: '0xtbay2h24tdhd3hmoykeptwtk4m4qyhdlqxahfxjr0', // ar
        //     dbname: 'testdb1',
        //     rollup: true,
        //     dir: './_rollups',
        // },

        // 'klaVHpNE-Z9z6ZuiMky8_nhvULg2iGoRdqgsE90-uXg': {
        //     secure: false,
        //     owner: '0x0fa4fe1a58a7815adbc16d74111462661843b83b', // eth
        //     // owner: '0x0Fa4fE1a58a7815ADBc16D74111462661843B83B', // eth 
        //     dbname: 'testdb2',
        //     rollup: true, 
            // dir: './_rollups',
        // },
        // 'ioRYutPpDbzDC6OCJSw03jhA6PzuQ-X1jF1HJDRt8AU': {
        //     secure: false,
        //     owner: '0x0fa4fe1a58a7815adbc16d74111462661843b83b', // eth
        //     // owner: '0x0Fa4fE1a58a7815ADBc16D74111462661843B83B', // eth 
        //     dbname: 'testdb3', 
        //     rollup: true,
            // dir: './_rollups',
        // }
    },
    
}
