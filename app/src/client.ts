const args = require('minimist')(process.argv.slice(2));
const anchor = require("@project-serum/anchor");
const provider = anchor.Provider.env();
const wallet = provider.wallet;

import { PublicKey } from "@solana/web3.js";

anchor.setProvider(provider);

const name = args['name'] || 'default_pool';
const description = args['description'] || 'lorem ipsum';

const programId = new anchor.web3.PublicKey('AJjyLsVoEfhz7ds1ZM9RU44Zkf6bNakFC86PxXM4B7kT');

async function main() {
    await createPool();
    // await updatePool();
}

async function createPool() {
    const json = require("fs").readFileSync('../target/idl/whirlpool.json', "utf8");

    const idl = JSON.parse(json);

    const program = new anchor.Program(idl, programId);

    const seeds = [
        anchor.utils.bytes.utf8.encode("pool-account"),
        wallet.publicKey.toBytes()
    ];

    const [ pda, bump ] = await PublicKey.findProgramAddress(seeds, program.programId);

    console.log('wallet address', wallet.publicKey);
    console.log('pool account', pda, bump);

    const accounts = {
        poolAccount: pda,
        admin: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
    };

    const signature = await program.rpc.createPool(
        bump,
        name,
        description, {
            accounts,
            options: { commitment: "confirmed" },
            signers: []
        });

    let transaction = await provider.connection.getTransaction(
        signature, { commitment: "confirmed" }
    );

    console.log(transaction.meta.logMessages);
}

// async function updatePool() {
//     const json = require("fs").readFileSync('../target/idl/whirlpool.json', 'utf8');
//
//     const idl = JSON.parse(json);
//
//     const program = new anchor.Program(idl, programId);
//
//     const accounts = {
//         poolAccount: poolAccount.publicKey,
//         authority: provider.wallet.publicKey,
//         systemProgram: anchor.web3.SystemProgram.programId
//     };
//
//     const signature = await program.rpc.updatePool(name, description, {
//        accounts,
//        options: { commitment: "confirmed" },
//        signers: [provider.wallet]
//     });
//
//     let transaction = await provider.connection.getTransaction(
//         signature, { commitment: "confirmed" }
//     );
//
//     console.log(transaction.meta.logMessages);
// }

console.log('Running client...');

main().then(() => console.log("Client finished"));
