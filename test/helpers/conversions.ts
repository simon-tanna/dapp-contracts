import hre from "hardhat";

export const toWei = (value: string) => {
  return hre.ethers.parseEther(value.toString());
};

export const toEther = (value: bigint) => {
  return hre.ethers.formatEther(value);
};
