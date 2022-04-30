"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var args = require('minimist')(process.argv.slice(2));
var web3_js_1 = require("@solana/web3.js");
var anchor = require("@project-serum/anchor");
var spl = require("@solana/spl-token");
var provider = anchor.Provider.env();
var wallet = provider.wallet;
anchor.setProvider(provider);
var name = args['name'] || 'default_pool';
var description = args['description'] || 'lorem ipsum';
var func = args['function'] || null;
var programId = new anchor.web3.PublicKey('AJjyLsVoEfhz7ds1ZM9RU44Zkf6bNakFC86PxXM4B7kT');
var Functions = /** @class */ (function () {
    function Functions() {
    }
    Functions.prototype.main = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log(func);
                        _a = func;
                        switch (_a) {
                            case 'createPool': return [3 /*break*/, 1];
                            case 'updatePool': return [3 /*break*/, 3];
                            case 'readPool': return [3 /*break*/, 5];
                            case 'deposit': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 9];
                    case 1: return [4 /*yield*/, this.tryCreatePool()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 3: return [4 /*yield*/, this.tryUpdatePool()];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 5: return [4 /*yield*/, this.tryReadPool()];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, this.tryDeposit()];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Functions.prototype.tryCreatePool = function () {
        return __awaiter(this, void 0, void 0, function () {
            var json, idl, program, seeds, _a, pda, bump, accounts, signature, transaction;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        json = require("fs").readFileSync('../target/idl/whirlpool.json', "utf8");
                        idl = JSON.parse(json);
                        program = new anchor.Program(idl, programId);
                        seeds = [
                            anchor.utils.bytes.utf8.encode("pool-account"),
                            wallet.publicKey.toBytes()
                        ];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress(seeds, program.programId)];
                    case 1:
                        _a = _b.sent(), pda = _a[0], bump = _a[1];
                        console.log('wallet address', wallet.publicKey);
                        console.log('pool account', pda, bump);
                        accounts = {
                            poolAccount: pda,
                            admin: provider.wallet.publicKey,
                            systemProgram: anchor.web3.SystemProgram.programId
                        };
                        return [4 /*yield*/, program.rpc.createPool(bump, name, description, {
                                accounts: accounts,
                                options: { commitment: "confirmed" },
                                signers: []
                            })];
                    case 2:
                        signature = _b.sent();
                        return [4 /*yield*/, provider.connection.getTransaction(signature, { commitment: "confirmed" })];
                    case 3:
                        transaction = _b.sent();
                        console.log(transaction.meta.logMessages);
                        return [2 /*return*/];
                }
            });
        });
    };
    Functions.prototype.tryUpdatePool = function () {
        return __awaiter(this, void 0, void 0, function () {
            var json, idl, program, seeds, _a, pda, bump, accounts, signature, transaction;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        json = require("fs").readFileSync('../target/idl/whirlpool.json', "utf8");
                        idl = JSON.parse(json);
                        program = new anchor.Program(idl, programId);
                        seeds = [
                            anchor.utils.bytes.utf8.encode("pool-account"),
                            wallet.publicKey.toBytes()
                        ];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress(seeds, program.programId)];
                    case 1:
                        _a = _b.sent(), pda = _a[0], bump = _a[1];
                        console.log('wallet address', wallet.publicKey);
                        console.log('pool account', pda, bump);
                        accounts = {
                            poolAccount: pda,
                            admin: provider.wallet.publicKey,
                            systemProgram: anchor.web3.SystemProgram.programId
                        };
                        return [4 /*yield*/, program.rpc.updatePool(bump, name, description, {
                                accounts: accounts,
                                options: { commitment: "confirmed" },
                                signers: []
                            })];
                    case 2:
                        signature = _b.sent();
                        return [4 /*yield*/, provider.connection.getTransaction(signature, { commitment: "confirmed" })];
                    case 3:
                        transaction = _b.sent();
                        console.log(transaction.meta.logMessages);
                        return [2 /*return*/];
                }
            });
        });
    };
    Functions.prototype.tryReadPool = function () {
        return __awaiter(this, void 0, void 0, function () {
            var json, idl, program, seeds, _a, pda, bump, accounts, signature, transaction;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        json = require("fs").readFileSync('../target/idl/whirlpool.json', "utf8");
                        idl = JSON.parse(json);
                        program = new anchor.Program(idl, programId);
                        seeds = [
                            anchor.utils.bytes.utf8.encode("pool-account"),
                            wallet.publicKey.toBytes()
                        ];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress(seeds, program.programId)];
                    case 1:
                        _a = _b.sent(), pda = _a[0], bump = _a[1];
                        console.log('wallet address', wallet.publicKey);
                        console.log('pool account', pda, bump);
                        accounts = {
                            poolAccount: pda,
                            admin: wallet.publicKey,
                            systemProgram: anchor.web3.SystemProgram.programId
                        };
                        return [4 /*yield*/, program.rpc.readPool(bump, {
                                accounts: accounts,
                                options: { commitment: "confirmed" },
                                signers: []
                            })];
                    case 2:
                        signature = _b.sent();
                        return [4 /*yield*/, provider.connection.getTransaction(signature, { commitment: "confirmed" })];
                    case 3:
                        transaction = _b.sent();
                        console.log(transaction.meta.logMessages);
                        return [2 /*return*/];
                }
            });
        });
    };
    Functions.prototype.tryDeposit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, user, tokenAccount, mint, _b, _, amount, json, idl, program, poolSeeds, _c, poolPDA, poolBump, stateSeeds, _d, statePDA, stateBump, escrowSeeds, _e, escrowPDA, escrowBump, accounts, signature, transaction;
            var _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0: return [4 /*yield*/, this.createUserTokenAccount()];
                    case 1:
                        _a = _h.sent(), user = _a[0], tokenAccount = _a[1], mint = _a[2];
                        console.log("User account: ".concat(user.publicKey), "TokenAccount: ".concat(tokenAccount));
                        return [4 /*yield*/, this.readTokenAccount(tokenAccount)];
                    case 2:
                        _b = _h.sent(), _ = _b[0], amount = _b[1];
                        console.log("User token amount: ".concat(amount));
                        json = require("fs").readFileSync('../target/idl/whirlpool.json', "utf8");
                        idl = JSON.parse(json);
                        program = new anchor.Program(idl, programId);
                        poolSeeds = [
                            anchor.utils.bytes.utf8.encode("pool-account"),
                            wallet.publicKey.toBytes()
                        ];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress(poolSeeds, program.programId)];
                    case 3:
                        _c = _h.sent(), poolPDA = _c[0], poolBump = _c[1];
                        stateSeeds = [
                            anchor.utils.bytes.utf8.encode("state-account"),
                            user.publicKey.toBytes(),
                            mint.toBytes(),
                        ];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress(stateSeeds, program.programId)];
                    case 4:
                        _d = _h.sent(), statePDA = _d[0], stateBump = _d[1];
                        escrowSeeds = [
                            anchor.utils.bytes.utf8.encode("escrow-account"),
                            user.publicKey.toBytes(),
                            mint.toBytes(),
                        ];
                        return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress(escrowSeeds, program.programId)];
                    case 5:
                        _e = _h.sent(), escrowPDA = _e[0], escrowBump = _e[1];
                        console.log('STATE PDA', statePDA, stateBump);
                        console.log('ESCROW PDA', escrowPDA, escrowBump);
                        console.log('POOL PDA', poolPDA, poolBump);
                        accounts = {
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
                        return [4 /*yield*/, program.rpc.deposit(stateBump, escrowBump, poolBump, new anchor.BN(10), {
                                accounts: accounts,
                                options: { commitment: "confirmed" },
                                signers: [user]
                            })];
                    case 6:
                        signature = _h.sent();
                        return [4 /*yield*/, provider.connection.getTransaction(signature, { commitment: "confirmed" })];
                    case 7:
                        transaction = _h.sent();
                        console.log(transaction.meta.logMessages);
                        return [4 /*yield*/, this.readTokenAccount(tokenAccount)];
                    case 8:
                        _f = _h.sent(), _ = _f[0], amount = _f[1];
                        console.log("User token amount: ".concat(amount));
                        return [4 /*yield*/, this.readTokenAccount(escrowPDA)];
                    case 9:
                        _g = _h.sent(), _ = _g[0], amount = _g[1];
                        console.log("Escrow token amount: ".concat(amount));
                        return [2 /*return*/];
                }
            });
        });
    };
    Functions.prototype.createMintAccount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tokenMint, lamportsForMint, transaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenMint = new anchor.web3.Keypair();
                        return [4 /*yield*/, provider.connection.getMinimumBalanceForRentExemption(spl.MintLayout.span)];
                    case 1:
                        lamportsForMint = _a.sent();
                        transaction = new anchor.web3.Transaction();
                        // Create dummy Mint
                        transaction.add(anchor.web3.SystemProgram.createAccount({
                            programId: spl.TOKEN_PROGRAM_ID,
                            space: spl.MintLayout.span,
                            fromPubkey: wallet.publicKey,
                            newAccountPubkey: tokenMint.publicKey,
                            lamports: lamportsForMint
                        }));
                        // Allocate lamports to mint wallet
                        transaction.add(spl.createInitializeMintInstruction(tokenMint.publicKey, 6, wallet.publicKey, wallet.publicKey, spl.TOKEN_PROGRAM_ID));
                        return [4 /*yield*/, provider.send(transaction, [tokenMint])];
                    case 2:
                        _a.sent();
                        console.log("Created new mint account at ".concat(tokenMint.publicKey));
                        return [2 /*return*/, tokenMint.publicKey];
                }
            });
        });
    };
    Functions.prototype.createUserTokenAccount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var mint, user, lamports, fundUserTransaction, userAssociatedTokenAccount, fundTokenAccountTransaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createMintAccount()];
                    case 1:
                        mint = _a.sent();
                        user = new anchor.web3.Keypair();
                        lamports = 5 * anchor.web3.LAMPORTS_PER_SOL;
                        fundUserTransaction = new anchor.web3.Transaction();
                        fundUserTransaction.add(anchor.web3.SystemProgram.transfer({
                            fromPubkey: wallet.publicKey,
                            toPubkey: user.publicKey,
                            lamports: lamports
                        }));
                        return [4 /*yield*/, provider.send(fundUserTransaction)];
                    case 2:
                        _a.sent();
                        console.log("New User ".concat(user.publicKey, " funded with ").concat(lamports, " lamports"));
                        return [4 /*yield*/, spl.getAssociatedTokenAddress(mint, user.publicKey, false, spl.TOKEN_PROGRAM_ID, spl.ASSOCIATED_TOKEN_PROGRAM_ID)];
                    case 3:
                        userAssociatedTokenAccount = _a.sent();
                        fundTokenAccountTransaction = new anchor.web3.Transaction();
                        fundTokenAccountTransaction.add(spl.createAssociatedTokenAccountInstruction(user.publicKey, userAssociatedTokenAccount, user.publicKey, mint, spl.TOKEN_PROGRAM_ID, spl.ASSOCIATED_TOKEN_PROGRAM_ID));
                        fundTokenAccountTransaction.add(spl.createMintToInstruction(mint, userAssociatedTokenAccount, wallet.publicKey, 1000, [], spl.TOKEN_PROGRAM_ID));
                        return [4 /*yield*/, provider.send(fundTokenAccountTransaction, [user])];
                    case 4:
                        _a.sent();
                        console.log("New associated account ".concat(userAssociatedTokenAccount, " for mint ").concat(mint, ")}"));
                        return [2 /*return*/, [user, userAssociatedTokenAccount, mint]];
                }
            });
        });
    };
    Functions.prototype.readTokenAccount = function (accountPublicKey) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenAccountInfo, data, accountInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, provider.connection.getAccountInfo(accountPublicKey)];
                    case 1:
                        tokenAccountInfo = _a.sent();
                        data = Buffer.from(tokenAccountInfo.data);
                        accountInfo = spl.AccountLayout.decode(data);
                        return [2 /*return*/, [accountInfo, accountInfo.amount]];
                }
            });
        });
    };
    return Functions;
}());
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var functions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    functions = new Functions();
                    return [4 /*yield*/, functions.main()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
console.log('Running client...');
main().then(function () { return console.log("Client finished"); });
