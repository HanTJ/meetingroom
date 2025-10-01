const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KJB Stable Coin", function () {
  let kjbCoin;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    // 계정들 가져오기
    [owner, user1, user2, user3] = await ethers.getSigners();

    // KJB 스테이블 코인 컨트랙트 배포
    const KJBStableCoin = await ethers.getContractFactory("KJBStableCoin");
    kjbCoin = await KJBStableCoin.deploy(owner.address);
    await kjbCoin.deployed();
  });

  describe("배포 및 초기 설정", function () {
    it("올바른 토큰 정보를 가져야 한다", async function () {
      expect(await kjbCoin.name()).to.equal("KJB Stable Coin");
      expect(await kjbCoin.symbol()).to.equal("KJB");
      expect(await kjbCoin.decimals()).to.equal(18);
    });

    it("소유자가 올바르게 설정되어야 한다", async function () {
      expect(await kjbCoin.owner()).to.equal(owner.address);
    });

    it("초기 공급량이 0이어야 한다", async function () {
      expect(await kjbCoin.totalSupply()).to.equal(0);
    });

    it("초기 지급량이 올바르게 설정되어야 한다", async function () {
      const initialGrant = await kjbCoin.INITIAL_GRANT();
      expect(initialGrant).to.equal(ethers.utils.parseEther("1000"));
    });
  });

  describe("초기 지급 기능", function () {
    it("사용자가 초기 지급을 받을 수 있어야 한다", async function () {
      // 초기 지급 전 상태 확인
      expect(await kjbCoin.hasClaimedInitialGrant(user1.address)).to.be.false;
      expect(await kjbCoin.balanceOf(user1.address)).to.equal(0);

      // 초기 지급 받기
      await kjbCoin.connect(user1).claimInitialGrant();

      // 초기 지급 후 상태 확인
      expect(await kjbCoin.hasClaimedInitialGrant(user1.address)).to.be.true;
      expect(await kjbCoin.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("1000"));
    });

    it("같은 사용자가 초기 지급을 두 번 받을 수 없어야 한다", async function () {
      // 첫 번째 초기 지급
      await kjbCoin.connect(user1).claimInitialGrant();

      // 두 번째 초기 지급 시도 - 실패해야 함
      await expect(
        kjbCoin.connect(user1).claimInitialGrant()
      ).to.be.revertedWith("KJB: initial grant already claimed");
    });

    it("여러 사용자가 각각 초기 지급을 받을 수 있어야 한다", async function () {
      // user1 초기 지급
      await kjbCoin.connect(user1).claimInitialGrant();
      expect(await kjbCoin.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("1000"));

      // user2 초기 지급
      await kjbCoin.connect(user2).claimInitialGrant();
      expect(await kjbCoin.balanceOf(user2.address)).to.equal(ethers.utils.parseEther("1000"));

      // 총 공급량 확인
      expect(await kjbCoin.totalSupply()).to.equal(ethers.utils.parseEther("2000"));
    });

    it("초기 지급 시 이벤트가 발생해야 한다", async function () {
      await expect(kjbCoin.connect(user1).claimInitialGrant())
        .to.emit(kjbCoin, "InitialGrantClaimed")
        .withArgs(user1.address, ethers.utils.parseEther("1000"));
    });
  });

  describe("관리자 발행 기능", function () {
    it("관리자만 토큰을 발행할 수 있어야 한다", async function () {
      const mintAmount = ethers.utils.parseEther("5000");

      // 관리자 발행 - 성공해야 함
      await kjbCoin.connect(owner).mint(user1.address, mintAmount);
      expect(await kjbCoin.balanceOf(user1.address)).to.equal(mintAmount);

      // 일반 사용자 발행 시도 - 실패해야 함
      await expect(
        kjbCoin.connect(user1).mint(user2.address, mintAmount)
      ).to.be.revertedWithCustomError(kjbCoin, "OwnableUnauthorizedAccount");
    });

    it("발행 시 총 공급량과 총 발행량이 증가해야 한다", async function () {
      const mintAmount = ethers.utils.parseEther("3000");

      await kjbCoin.connect(owner).mint(user1.address, mintAmount);

      expect(await kjbCoin.totalSupply()).to.equal(mintAmount);
      expect(await kjbCoin.totalMinted()).to.equal(mintAmount);
    });

    it("0개 주소로 발행할 수 없어야 한다", async function () {
      await expect(
        kjbCoin.connect(owner).mint(ethers.constants.AddressZero, ethers.utils.parseEther("1000"))
      ).to.be.revertedWith("KJB: mint to zero address");
    });

    it("0개 토큰을 발행할 수 없어야 한다", async function () {
      await expect(
        kjbCoin.connect(owner).mint(user1.address, 0)
      ).to.be.revertedWith("KJB: mint amount must be greater than 0");
    });

    it("발행 시 이벤트가 발생해야 한다", async function () {
      const mintAmount = ethers.utils.parseEther("2000");

      await expect(kjbCoin.connect(owner).mint(user1.address, mintAmount))
        .to.emit(kjbCoin, "TokensMinted")
        .withArgs(user1.address, mintAmount);
    });
  });

  describe("소각 기능", function () {
    beforeEach(async function () {
      // 테스트용 토큰 지급
      await kjbCoin.connect(user1).claimInitialGrant(); // 1000 KJB
      await kjbCoin.connect(owner).mint(user2.address, ethers.utils.parseEther("2000")); // 2000 KJB
    });

    it("사용자가 자신의 토큰을 소각할 수 있어야 한다", async function () {
      const burnAmount = ethers.utils.parseEther("500");
      const initialBalance = await kjbCoin.balanceOf(user1.address);

      await kjbCoin.connect(user1).burn(burnAmount);

      expect(await kjbCoin.balanceOf(user1.address)).to.equal(initialBalance.sub(burnAmount));
      expect(await kjbCoin.totalBurned()).to.equal(burnAmount);
    });

    it("잔액보다 많은 토큰을 소각할 수 없어야 한다", async function () {
      const burnAmount = ethers.utils.parseEther("1500"); // user1은 1000 KJB만 가지고 있음

      await expect(
        kjbCoin.connect(user1).burn(burnAmount)
      ).to.be.revertedWith("KJB: insufficient balance to burn");
    });

    it("0개 토큰을 소각할 수 없어야 한다", async function () {
      await expect(
        kjbCoin.connect(user1).burn(0)
      ).to.be.revertedWith("KJB: burn amount must be greater than 0");
    });

    it("소각 시 이벤트가 발생해야 한다", async function () {
      const burnAmount = ethers.utils.parseEther("300");

      await expect(kjbCoin.connect(user1).burn(burnAmount))
        .to.emit(kjbCoin, "TokensBurned")
        .withArgs(user1.address, burnAmount);
    });
  });

  describe("대신 소각 기능", function () {
    beforeEach(async function () {
      // 테스트용 토큰 지급
      await kjbCoin.connect(user1).claimInitialGrant(); // 1000 KJB
      await kjbCoin.connect(user2).claimInitialGrant(); // 1000 KJB
    });

    it("허용량 내에서 다른 사용자의 토큰을 소각할 수 있어야 한다", async function () {
      const burnAmount = ethers.utils.parseEther("200");

      // user1이 user2에게 소각 허용
      await kjbCoin.connect(user1).approve(user2.address, burnAmount);

      // user2가 user1의 토큰을 소각
      await kjbCoin.connect(user2).burnFrom(user1.address, burnAmount);

      expect(await kjbCoin.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("800"));
      expect(await kjbCoin.totalBurned()).to.equal(burnAmount);
    });

    it("허용량을 초과하여 소각할 수 없어야 한다", async function () {
      const allowAmount = ethers.utils.parseEther("200");
      const burnAmount = ethers.utils.parseEther("300");

      // user1이 user2에게 200 KJB만 허용
      await kjbCoin.connect(user1).approve(user2.address, allowAmount);

      // user2가 300 KJB 소각 시도 - 실패해야 함
      await expect(
        kjbCoin.connect(user2).burnFrom(user1.address, burnAmount)
      ).to.be.revertedWith("KJB: insufficient allowance to burn");
    });
  });

  describe("이체 기능", function () {
    beforeEach(async function () {
      // 테스트용 토큰 지급
      await kjbCoin.connect(user1).claimInitialGrant(); // 1000 KJB
      await kjbCoin.connect(user2).claimInitialGrant(); // 1000 KJB
    });

    it("일반 사용자가 토큰을 이체할 수 있어야 한다", async function () {
      const transferAmount = ethers.utils.parseEther("300");

      await kjbCoin.connect(user1).transfer(user3.address, transferAmount);

      expect(await kjbCoin.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("700"));
      expect(await kjbCoin.balanceOf(user3.address)).to.equal(transferAmount);
    });

    it("허용량 내에서 대신 이체할 수 있어야 한다", async function () {
      const transferAmount = ethers.utils.parseEther("250");

      // user1이 user2에게 이체 허용
      await kjbCoin.connect(user1).approve(user2.address, transferAmount);

      // user2가 user1의 토큰을 user3에게 이체
      await kjbCoin.connect(user2).transferFrom(user1.address, user3.address, transferAmount);

      expect(await kjbCoin.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("750"));
      expect(await kjbCoin.balanceOf(user3.address)).to.equal(transferAmount);
    });
  });

  describe("통계 및 조회 기능", function () {
    it("컨트랙트 통계를 올바르게 반환해야 한다", async function () {
      // 초기 지급과 발행
      await kjbCoin.connect(user1).claimInitialGrant(); // 1000 KJB
      await kjbCoin.connect(owner).mint(user2.address, ethers.utils.parseEther("3000")); // 3000 KJB

      // 소각
      await kjbCoin.connect(user1).burn(ethers.utils.parseEther("200")); // 200 KJB 소각

      const stats = await kjbCoin.getStats();
      expect(stats[0]).to.equal(ethers.utils.parseEther("3800")); // 총 공급량: 4000 - 200
      expect(stats[1]).to.equal(ethers.utils.parseEther("4000")); // 총 발행량: 1000 + 3000
      expect(stats[2]).to.equal(ethers.utils.parseEther("200"));  // 총 소각량: 200
    });

    it("초기 지급 여부를 올바르게 확인해야 한다", async function () {
      expect(await kjbCoin.hasClaimedInitialGrant(user1.address)).to.be.false;

      await kjbCoin.connect(user1).claimInitialGrant();

      expect(await kjbCoin.hasClaimedInitialGrant(user1.address)).to.be.true;
    });
  });

  describe("보안 및 제한 사항", function () {
    it("소유권을 포기할 수 없어야 한다", async function () {
      await expect(
        kjbCoin.connect(owner).renounceOwnership()
      ).to.be.revertedWith("KJB: ownership cannot be renounced");
    });

    it("소유권 이전은 가능해야 한다", async function () {
      await kjbCoin.connect(owner).transferOwnership(user1.address);
      expect(await kjbCoin.owner()).to.equal(user1.address);
    });
  });
});