// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KJB Stable Coin
 * @dev ERC20 스테이블 코인으로 다음 기능을 제공합니다:
 * - 관리자만 토큰 발행(mint) 가능
 * - 모든 사용자가 이체(transfer) 가능
 * - 모든 사용자가 소각(burn) 가능
 * - 최초 지갑 생성시 1000 KJB 기본 지급
 */
contract KJBStableCoin is ERC20, Ownable, ReentrancyGuard {
    // 초기 지급량 (1000 KJB = 1000 * 10^18)
    uint256 public constant INITIAL_GRANT = 1000 * 10**18;

    // 이미 초기 지급을 받은 주소들을 추적
    mapping(address => bool) public hasReceivedInitialGrant;

    // 총 발행량 추적
    uint256 public totalMinted;

    // 총 소각량 추적
    uint256 public totalBurned;

    // 이벤트
    event InitialGrantClaimed(address indexed recipient, uint256 amount);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    /**
     * @dev 컨트랙트 생성자
     * @param _owner 컨트랙트 소유자 주소 (관리자)
     */
    constructor(address _owner) ERC20("KJB Stable Coin", "KJB") Ownable(_owner) {
        // 생성자에서는 토큰을 발행하지 않음
        // 사용자가 claimInitialGrant를 호출해야 함
    }

    /**
     * @dev 관리자만 토큰을 발행할 수 있습니다
     * @param to 토큰을 받을 주소
     * @param amount 발행할 토큰 양
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "KJB: mint to zero address");
        require(amount > 0, "KJB: mint amount must be greater than 0");

        _mint(to, amount);
        totalMinted += amount;

        emit TokensMinted(to, amount);
    }

    /**
     * @dev 사용자가 자신의 토큰을 소각할 수 있습니다
     * @param amount 소각할 토큰 양
     */
    function burn(uint256 amount) external {
        require(amount > 0, "KJB: burn amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "KJB: insufficient balance to burn");

        _burn(msg.sender, amount);
        totalBurned += amount;

        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev 다른 사용자의 토큰을 대신 소각할 수 있습니다 (허용량 내에서)
     * @param from 토큰을 소각할 주소
     * @param amount 소각할 토큰 양
     */
    function burnFrom(address from, uint256 amount) external {
        require(amount > 0, "KJB: burn amount must be greater than 0");
        require(from != address(0), "KJB: burn from zero address");

        uint256 currentAllowance = allowance(from, msg.sender);
        require(currentAllowance >= amount, "KJB: insufficient allowance to burn");

        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
        totalBurned += amount;

        emit TokensBurned(from, amount);
    }

    /**
     * @dev 최초 지갑 생성시 1000 KJB를 지급받습니다
     * 각 주소당 한 번만 받을 수 있습니다
     */
    function claimInitialGrant() external nonReentrant {
        require(!hasReceivedInitialGrant[msg.sender], "KJB: initial grant already claimed");
        require(msg.sender != address(0), "KJB: claim from zero address");

        hasReceivedInitialGrant[msg.sender] = true;
        _mint(msg.sender, INITIAL_GRANT);
        totalMinted += INITIAL_GRANT;

        emit InitialGrantClaimed(msg.sender, INITIAL_GRANT);
    }

    /**
     * @dev 사용자가 초기 지급을 받았는지 확인합니다
     * @param account 확인할 주소
     * @return 초기 지급 여부
     */
    function hasClaimedInitialGrant(address account) external view returns (bool) {
        return hasReceivedInitialGrant[account];
    }

    /**
     * @dev 컨트랙트의 전체 통계를 반환합니다
     * @return _totalSupply 현재 총 공급량
     * @return _totalMinted 총 발행량
     * @return _totalBurned 총 소각량
     */
    function getStats() external view returns (
        uint256 _totalSupply,
        uint256 _totalMinted,
        uint256 _totalBurned
    ) {
        return (totalSupply(), totalMinted, totalBurned);
    }

    /**
     * @dev 토큰의 소수점 자릿수를 반환합니다
     * @return 18 (ETH와 동일한 소수점 자릿수)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }

    /**
     * @dev 관리자가 컨트랙트 소유권을 포기할 수 없도록 오버라이드
     */
    function renounceOwnership() public pure override {
        revert("KJB: ownership cannot be renounced");
    }
}