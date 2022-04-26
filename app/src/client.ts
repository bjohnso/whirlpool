const args = require('minimist')(process.argv.slice(2));
const anchor = require("@project-serum/anchor");
const provider = anchor.Provider.env();
const wallet = provider.wallet;

import { PublicKey } from "@solana/web3.js";

anchor.setProvider(provider);

const name = args['name'] || 'default_pool';
const description = args['description'] || 'lorem ipsum';
const func = args['function'] || null;

const programId = new anchor.web3.PublicKey('AJjyLsVoEfhz7ds1ZM9RU44Zkf6bNakFC86PxXM4B7kT');

class Functions {
    async main() {
        if (func == 'createPool') {
            await this.createPool();
        } else if (func == 'updatePool') {
            await this.updatePool();
        } else if (func == 'readPool') {
            await this.readPool();
        }
    }

    async createPool() {
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

    async updatePool() {
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

        const signature = await program.rpc.updatePool(
            bump,
            name,
            description,
            {
                accounts,
                options: { commitment: "confirmed" },
                signers: []
            });

        let transaction = await provider.connection.getTransaction(
            signature, { commitment: "confirmed" }
        );

        console.log(transaction.meta.logMessages);
    }

    async readPool() {
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

        const signature = await program.rpc.readPool(
            bump,
            {
                accounts,
                options: { commitment: "confirmed" },
                signers: []
            });

        let transaction = await provider.connection.getTransaction(
            signature, { commitment: "confirmed" }
        );

        console.log(transaction.meta.logMessages);
    }
}

async function main() {
    const functions = new Functions();
    await functions.main();
}

console.log('Running client...');

main().then(() => console.log("Client finished"));
