import * as anchor from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import "dotenv/config";

export const rent = anchor.web3.SYSVAR_RENT_PUBKEY;
export const clock = anchor.web3.SYSVAR_CLOCK_PUBKEY;
export const systemProgram = anchor.web3.SystemProgram.programId;
export const tokenProgram = TOKEN_PROGRAM_ID;

export const registryId = "8LRxyb7ftDYSbSsZ3pqbW9jjUZgMGSZhx69BLtLVBdBf";
export const wrapperId = "G3gAj3jDFwPNwWVsXR52AQFNv6jGoRUKPmzuLPYoupiC";

// mainnet
export const raydiumProgramId = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
export const serumProgramId = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";
export const routeSwapProgramId =
  "93BgeoLHo5AdNbpqy9bD12dtfxtA5M2fh3rj72bE35Y3";

// devnet
// export const raydiumProgramId = "9rpQHSyFVM1dkkHFQ2TtTzPEW7DVmEyPmN8wVniqJtuC";
// export const serumProgramId = "DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY";

export const USDTUSDC = {
  ammId: "7TbGqz32RsuwXbXY7EyBCiAnMbJq1gm1wKmfjQjuwoyF",
  ammAuthority: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
  ammOpenOrders: "6XXvXS3meWqnftEMUgdY8hDWGJfrb8t22x2k1WyVYwhF",
  ammTargetOrders: "AXY75qWM1t5X16FaeUovd9ZjL1W698cV843sDHV5EMqb",
  poolCoinTokenAccount: "Enb9jGaKzgDBfEbbUN3Ytx2ZLoZuBhBpjVX6DULiRmvu",
  poolPcTokenAccount: "HyyZpz1JUZjsfyiVSt3qz6E9PkwnBcyhUg4zKGthMNeH",

  serumMarket: "77quYg4MGneUdjgXCunt9GgM1usmrxKY31twEy3WHwcS",
  serumBids: "37m9QdvxmKRdjm3KKV2AjTiGcXMfWHQpVFnmhtb289yo",
  serumAsks: "AQKXXC29ybqL8DLeAVNt3ebpwMv8Sb4csberrP6Hz6o5",
  serumEventQueue: "9MgPMkdEHFX7DZaitSh6Crya3kCCr1As6JC75bm3mjuC",
  serumCoinVaultAccount: "H61Y7xVnbWVXrQQx3EojTEqf3ogKVY5GfGjEn5ewyX7B",
  serumPcVaultAccount: "9FLih4qwFMjdqRAGmHeCxa64CgjP1GtcgKJgHHgz44ar",
  serumVaultSigner: "FGBvMAu88q9d1Csz7ZECB5a2gbWwp6qicNxN2Mo7QhWG",
};

export const USDCRAY = {
  ammId: "DVa7Qmb5ct9RCpaU7UTpSaf3GVMYz17vNVU67XpdCRut",
  ammAuthority: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
  ammOpenOrders: "7UF3m8hDGZ6bNnHzaT2YHrhp7A7n9qFfBj6QEpHPv5S8",
  ammTargetOrders: "3K2uLkKwVVPvZuMhcQAPLF8hw95somMeNwJS7vgWYrsJ",
  poolCoinTokenAccount: "3wqhzSB9avepM9xMteiZnbJw75zmTBDVmPFLTQAGcSMN",
  poolPcTokenAccount: "5GtSbKJEPaoumrDzNj4kGkgZtfDyUceKaHrPziazALC1",

  serumMarket: "teE55QrL4a4QSfydR9dnHF97jgCfptpuigbb53Lo95g",
  serumBids: "AvKStCiY8LTp3oDFrMkiHHxxhxk4sQUWnGVcetm4kRpy",
  serumAsks: "Hj9kckvMX96mQokfMBzNCYEYMLEBYKQ9WwSc1GxasW11",
  serumEventQueue: "58KcficuUqPDcMittSddhT8LzsPJoH46YP4uURoMo5EB",
  serumCoinVaultAccount: "2kVNVEgHicvfwiyhT2T51YiQGMPFWLMSp8qXc1hHzkpU",
  serumPcVaultAccount: "5AXZV7XfR7Ctr6yjQ9m9dbgycKeUXWnWqHwBTZT6mqC7",
  serumVaultSigner: "HzWpBN6ucpsA9wcfmhLAFYqEUmHjE9n2cGHwunG5avpL",
};

// devnet
export const TESTTEST = {
  ammId: "HeD1cekRWUNR25dcvW8c9bAHeKbr1r7qKEhv7pEegr4f",
  ammAuthority: "DhVpojXMTbZMuTaCgiiaFU7U8GvEEhnYo4G9BUdiEYGh",
  ammOpenOrders: "HboQAt9BXyejnh6SzdDNTx4WELMtRRPCr7pRSLpAW7Eq",
  ammTargetOrders: "6TzAjFPVZVMjbET8vUSk35J9U2dEWFCrnbHogsejRE5h",
  poolCoinTokenAccount: "3qbeXHwh9Sz4zabJxbxvYGJc57DZHrFgYMCWnaeNJENT",
  poolPcTokenAccount: "FrGPG5D4JZVF5ger7xSChFVFL8M9kACJckzyCz8tVowz",

  serumMarket: "3tsrPhKrWHWMB8RiPaqNxJ8GnBhZnDqL4wcu5EAMFeBe",
  serumBids: "ANHHchetdZVZBuwKWgz8RSfVgCDsRpW9i2BNWrmG9Jh9",
  serumAsks: "ESSri17GNbVttqrp7hrjuXtxuTcCqytnrMkEqr29gMGr",
  serumEventQueue: "FGAW7QqNJGFyhakh5jPzGowSb8UqcSJ95ZmySeBgmVwt",
  serumCoinVaultAccount: "E1E5kQqWXkXbaqVzpY5P2EQUSi8PNAHdCnqsj3mPWSjG",
  serumPcVaultAccount: "3sj6Dsw8fr8MseXpCnvuCSczR8mQjCWNyWDC5cAfEuTq",
  serumVaultSigner: "C2fDkZJqHH5PXyQ7UWBNZsmu6vDXxrEbb9Ex9KF7XsAE",
};
