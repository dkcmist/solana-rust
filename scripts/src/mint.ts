import * as anchor from "@project-serum/anchor";
import { Program, BN } from "@project-serum/anchor";

import {
  rent,
  clock,
  systemProgram,
  tokenProgram,
  wrapperId,
} from "./constant";

import assert from "assert";

import {
  WrapperRaydium,
  IDL as WrapperRaydiumIdl,
} from "./types/wrapper_raydium";
import deployerKey from "./keys/deployer.json";
import { Token } from "@solana/spl-token";

async function main() {
  const connection = new anchor.web3.Connection(
    process.env.SOLANA_NETWORK || "https://api.devnet.solana.com"
  );

  const initializer = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from([126,218,91,206,170,129,224,44,74,68,87,211,125,45,7,198,94,231,152,88,34,136,164,192,128,193,34,233,81,123,183,57,46,183,53,172,18,161,72,81,251,126,133,235,247,180,254,81,87,40,41,88,141,85,112,158,238,230,161,11,250,198,179,133])
  );
  const wallet = new anchor.Wallet(initializer);
  const provider = new anchor.Provider(connection, wallet, {
    preflightCommitment: "recent",
    commitment: "recent",
  });
  anchor.setProvider(provider);

  const dest = new anchor.web3.PublicKey("CbsSUTHmwruhA6sxk6LcBp2TEAGkfkxKbi2i3ro62vKb");
  const pcToken = new Token(connection, new anchor.web3.PublicKey("BEcGFQK1T1tSu3kvHC17cyCkQ5dvXqAJ7ExB2bb5Do7a"), tokenProgram, initializer);  
  const coinToken = new Token(connection, new anchor.web3.PublicKey("FSRvxBNrQWX2Fy2qvKMLL3ryEdRtE3PUTZBcdKwASZTU"), tokenProgram, initializer);
  const pcTokenAcc = await pcToken.getOrCreateAssociatedAccountInfo(dest);
  await pcToken.mintTo(pcTokenAcc.address, initializer, [], 100000000000000);
  const coinTokenAcc = await coinToken.getOrCreateAssociatedAccountInfo(dest);
  await coinToken.mintTo(coinTokenAcc.address, initializer, [], 100000000000000);
}

main();
