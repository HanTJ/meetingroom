const { ethers } = require("hardhat");

async function main() {
  console.log("KJB 스테이블 코인 배포를 시작합니다...");

  // 배포자 정보 가져오기
  const [deployer] = await ethers.getSigners();
  console.log("배포자 주소:", deployer.address);

  // 배포자 잔액 확인
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("배포자 잔액:", ethers.utils.formatEther(balance), "ETH");

  // KJB 스테이블 코인 컨트랙트 배포
  console.log("\nKJB 스테이블 코인 컨트랙트를 배포 중...");

  const KJBStableCoin = await ethers.getContractFactory("KJBStableCoin");

  // 배포자를 관리자로 설정
  const kjbCoin = await KJBStableCoin.deploy(deployer.address);
  await kjbCoin.deployed();

  const kjbAddress = kjbCoin.address;
  console.log("✅ KJB 스테이블 코인 배포 완료!");
  console.log("📍 컨트랙트 주소:", kjbAddress);
  console.log("👤 관리자 주소:", deployer.address);

  // 배포된 컨트랙트 정보 확인
  console.log("\n=== 컨트랙트 정보 ===");
  console.log("토큰 이름:", await kjbCoin.name());
  console.log("토큰 심볼:", await kjbCoin.symbol());
  console.log("소수점 자릿수:", await kjbCoin.decimals());
  console.log("초기 지급량:", ethers.utils.formatEther(await kjbCoin.INITIAL_GRANT()), "KJB");

  // 통계 정보 확인
  const stats = await kjbCoin.getStats();
  console.log("\n=== 현재 통계 ===");
  console.log("총 공급량:", ethers.utils.formatEther(stats[0]), "KJB");
  console.log("총 발행량:", ethers.utils.formatEther(stats[1]), "KJB");
  console.log("총 소각량:", ethers.utils.formatEther(stats[2]), "KJB");

  // 테스트용 초기 지급 받기
  console.log("\n=== 테스트: 배포자 초기 지급 받기 ===");

  const hasClaimedBefore = await kjbCoin.hasClaimedInitialGrant(deployer.address);
  console.log("초기 지급 받았는지 여부:", hasClaimedBefore);

  if (!hasClaimedBefore) {
    console.log("초기 지급을 받습니다...");
    const claimTx = await kjbCoin.claimInitialGrant();
    await claimTx.wait();

    const balance = await kjbCoin.balanceOf(deployer.address);
    console.log("✅ 초기 지급 완료! 잔액:", ethers.utils.formatEther(balance), "KJB");

    // 업데이트된 통계 확인
    const newStats = await kjbCoin.getStats();
    console.log("업데이트된 총 공급량:", ethers.utils.formatEther(newStats[0]), "KJB");
    console.log("업데이트된 총 발행량:", ethers.utils.formatEther(newStats[1]), "KJB");
  }

  console.log("\n=== 배포 완료 ===");
  console.log("컨트랙트 주소를 저장해 두세요:", kjbAddress);

  // 배포 정보를 파일에 저장
  const deploymentInfo = {
    contractAddress: kjbAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    network: "development",
    tokenName: "KJB Stable Coin",
    tokenSymbol: "KJB",
    initialGrant: "1000"
  };

  const fs = require('fs');
  fs.writeFileSync(
    './deployment-kjb.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 배포 정보가 deployment-kjb.json에 저장되었습니다.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("배포 중 오류 발생:", error);
    process.exit(1);
  });