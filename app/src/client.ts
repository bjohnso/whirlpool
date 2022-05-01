const args = require('minimist')(process.argv.slice(2));

import { PublicKey } from '@solana/web3.js';

const anchor = require("@project-serum/anchor");
const spl = require("@solana/spl-token");

const provider = anchor.Provider.env();
const wallet = provider.wallet;

anchor.setProvider(provider);

const name = args['name'] || 'default_pool';
const description = args['description'] || 'lorem ipsum';
const mintAccount = args['mint'] || undefined;
const func = args['function'] || null;

const programId = new anchor.web3.PublicKey('AJjyLsVoEfhz7ds1ZM9RU44Zkf6bNakFC86PxXM4B7kT');

class Functions {
    async main() {

        console.log(func);

        switch (func) {
            case 'createPool':
                await this.tryCreatePool();
                break;
            case 'updatePool':
                await this.tryUpdatePool();
                break;
            case 'readPool':
                await this.tryReadPool();
                break;
            case 'deposit':
                await this.tryDeposit();
        }
    }

    async tryCreatePool() {
        const json = require("fs").readFileSync('../target/idl/whirlpool.json', "utf8");

        const idl = JSON.parse(json);

        const program = new anchor.Program(idl, programId);

        const mint = await this.createMintAccount();

        const poolAccountSeeds = [
            anchor.utils.bytes.utf8.encode("pool-account"),
            wallet.publicKey.toBytes()
        ];

        const [ poolPDA, poolBump ] = await PublicKey.findProgramAddress(poolAccountSeeds, program.programId);

        const poolTokenAccountSeeds = [
            anchor.utils.bytes.utf8.encode("pool-token-account"),
            wallet.publicKey.toBytes(),
            mint.toBytes(),
        ];

        const [ poolTokenPDA, poolTokenBump ] = await PublicKey.findProgramAddress(poolTokenAccountSeeds, program.programId);

        await this.createPDATokenAccount(mint, poolPDA);

        console.log('wallet address', wallet.publicKey);
        console.log('pool account', poolPDA, poolBump);
        console.log('pool token account', poolTokenPDA, poolTokenBump);

        const accounts = {
            admin: wallet.publicKey,
            poolAccount: poolPDA,
            tokenAccount: poolTokenPDA,
            mint: mint,
            systemProgram: anchor.web3.SystemProgram.programId,
            associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY
        };

        const signature = await program.rpc.createPool(
            poolBump,
            poolTokenBump,
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

    async tryUpdatePool() {
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

    async tryReadPool() {
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
            admin: wallet.publicKey,
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

    async tryDeposit() {
        const mint = new PublicKey(mintAccount);
        const [user, tokenAccount] = await this.createUserTokenAccount(mint);
        console.log(`User account: ${user.publicKey}`, `TokenAccount: ${tokenAccount}`);

        let [_, amount] = await this.readTokenAccount(tokenAccount);
        console.log(`User token amount: ${amount}`);

        const json = require("fs").readFileSync('../target/idl/whirlpool.json', "utf8");

        const idl = JSON.parse(json);

        const program = new anchor.Program(idl, programId);

        const poolSeeds = [
            anchor.utils.bytes.utf8.encode("pool-account"),
            wallet.publicKey.toBytes()
        ];

        const [ poolPDA, poolBump ] = await PublicKey.findProgramAddress(poolSeeds, program.programId);

        const stateSeeds = [
            anchor.utils.bytes.utf8.encode("state-account"),
            user.publicKey.toBytes(),
        ];

        const [ statePDA, stateBump ] = await PublicKey.findProgramAddress(stateSeeds, program.programId);

        const escrowSeeds = [
            anchor.utils.bytes.utf8.encode("escrow-account"),
            user.publicKey.toBytes(),
        ];

        const [ escrowPDA, escrowBump ] = await PublicKey.findProgramAddress(escrowSeeds, program.programId);

        console.log('STATE PDA', statePDA, stateBump);
        console.log('ESCROW PDA', escrowPDA, escrowBump);
        console.log('POOL PDA', poolPDA, poolBump);

        const accounts = {
            user: user.publicKey,
            donorAccount: tokenAccount,
            admin: wallet.publicKey,
            mint: mint,
            stateAccount: statePDA,
            escrowAccount: escrowPDA,
            poolAccount: poolPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY
        };

        const signature = await program.rpc.deposit(
            stateBump,
            escrowBump,
            poolBump,
            new anchor.BN(10),
            {
                accounts,
                options: { commitment: "confirmed" },
                signers: [user]
            });

        let transaction = await provider.connection.getTransaction(
            signature, { commitment: "confirmed" }
        );

        console.log(transaction.meta.logMessages);

        [_, amount] = await this.readTokenAccount(tokenAccount);
        console.log(`User token amount: ${amount}`);

        [_, amount] = await this.readTokenAccount(escrowPDA);
        console.log(`Escrow token amount: ${amount}`);
    }

    private async createMintAccount(): Promise<PublicKey> {
        const tokenMint = new anchor.web3.Keypair();
        const lamportsForMint = await provider.connection.getMinimumBalanceForRentExemption(spl.MintLayout.span);

        let transaction = new anchor.web3.Transaction();

        // Create dummy Mint
        transaction.add(
            anchor.web3.SystemProgram.createAccount({
                programId: spl.TOKEN_PROGRAM_ID,
                space: spl.MintLayout.span,
                fromPubkey: wallet.publicKey,
                newAccountPubkey: tokenMint.publicKey,
                lamports: lamportsForMint
            })
        );

        // Allocate lamports to mint wallet
        transaction.add(
            spl.createInitializeMintInstruction(
                tokenMint.publicKey,
                6,
                wallet.publicKey,
                wallet.publicKey,
                spl.TOKEN_PROGRAM_ID,
            )
        );

        await provider.send(transaction, [tokenMint]);

        console.log(`Created new mint account at ${tokenMint.publicKey}`);

        return tokenMint.publicKey;
    }

    private async createPDATokenAccount(mint: PublicKey, owner: PublicKey) {
        const associatedTokenAccount = await spl.getAssociatedTokenAddress(
            mint,
            owner,
            true,
            spl.TOKEN_PROGRAM_ID,
            spl.ASSOCIATED_TOKEN_PROGRAM_ID
        );

        console.log(`associatedTokenAccount`, associatedTokenAccount);

        let fundTokenAccountTransaction = new anchor.web3.Transaction();

        fundTokenAccountTransaction.add(
            spl.createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                associatedTokenAccount,
                owner,
                mint,
                spl.TOKEN_PROGRAM_ID,
                spl.ASSOCIATED_TOKEN_PROGRAM_ID
            )
        );

        await provider.send(fundTokenAccountTransaction, []);

        console.log(`New associated account ${associatedTokenAccount} for mint ${mint}`);

        return associatedTokenAccount;
    }

    private async createUserTokenAccount(mint: PublicKey) {
        const user = new anchor.web3.Keypair();
        const lamports = 5 * anchor.web3.LAMPORTS_PER_SOL;

        let fundUserTransaction = new anchor.web3.Transaction();

        fundUserTransaction.add(anchor.web3.SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: user.publicKey,
            lamports
        }));

        await provider.send(fundUserTransaction);

        console.log(`New User ${user.publicKey} funded with ${lamports} lamports`);

        const userAssociatedTokenAccount = await spl.getAssociatedTokenAddress(
            mint,
            user.publicKey,
            false,
            spl.TOKEN_PROGRAM_ID,
            spl.ASSOCIATED_TOKEN_PROGRAM_ID
        );

        let fundTokenAccountTransaction = new anchor.web3.Transaction();

        fundTokenAccountTransaction.add(
            spl.createAssociatedTokenAccountInstruction(
                user.publicKey,
                userAssociatedTokenAccount,
                user.publicKey,
                mint,
                spl.TOKEN_PROGRAM_ID,
                spl.ASSOCIATED_TOKEN_PROGRAM_ID
            )
        );

        fundTokenAccountTransaction.add(
            spl.createMintToInstruction(
                mint,
                userAssociatedTokenAccount,
                wallet.publicKey,
                1000,
                [],
                spl.TOKEN_PROGRAM_ID
            )
        );

        await provider.send(fundTokenAccountTransaction, [user]);

        console.log(`New associated account ${userAssociatedTokenAccount} for mint ${mint}}`);

        return [user, userAssociatedTokenAccount];
    }

    private async readTokenAccount (accountPublicKey: PublicKey) {
        const tokenAccountInfo = await provider.connection.getAccountInfo(accountPublicKey);
        const data = Buffer.from(tokenAccountInfo.data);
        const accountInfo = spl.AccountLayout.decode(data);

        return [accountInfo, accountInfo.amount];
    }
}

async function main() {
    const functions = new Functions();
    await functions.main();
}

console.log('Running client...');

main().then(() => console.log("Client finished"));
