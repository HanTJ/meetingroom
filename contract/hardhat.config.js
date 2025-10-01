require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    hardhat: {
      chainId: 1234
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // 실제 프라이빗 블록체인 네트워크 정보로 교체 필요
    // url: 실제 프라이빗 네트워크 RPC URL
    // accounts: 실제 배포자 계정의 프라이빗 키 (보안 주의!)
    privatePoA: {
      url: "http://192.168.1.100:8545",
      accounts: ["0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"]
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
