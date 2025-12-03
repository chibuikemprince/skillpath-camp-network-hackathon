// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CampCertificate - minimal on-chain certificate registry
/// @notice Stores a single certificate per wallet, keyed by userId + wallet address.
contract CampCertificate {
    struct Certificate {
        string userId;
        string walletId;
        string curriculumId;
        string metadataUri; // e.g. IPFS/Arweave pointer to the certificate JSON
        uint256 issuedAt;
        address issuer;
        bool exists;
    }

    mapping(bytes32 => Certificate) private certificates;

    event CertificateIssued(
        bytes32 indexed certKey,
        string indexed userId,
        address indexed wallet,
        string curriculumId,
        string metadataUri,
        uint256 issuedAt,
        address issuer
    );

    /// @notice Create a certificate for a user/wallet pair.
    /// @dev In a real deployment you'd likely restrict this (e.g., onlyOwner).
    ///      For hack/demo, anyone can write; front-end should pass the app wallet as issuer.
    function issueCertificate(
        string calldata userId,
        address wallet,
        string calldata curriculumId,
        string calldata metadataUri
    ) external returns (bytes32 certKey) {
        require(wallet != address(0), "wallet required");
        require(bytes(userId).length > 0, "userId required");

        certKey = _certKey(userId, wallet);
        Certificate storage cert = certificates[certKey];

        cert.userId = userId;
        cert.walletId = _toHexString(wallet);
        cert.curriculumId = curriculumId;
        cert.metadataUri = metadataUri;
        cert.issuedAt = block.timestamp;
        cert.issuer = msg.sender;
        cert.exists = true;

        emit CertificateIssued(
            certKey,
            userId,
            wallet,
            curriculumId,
            metadataUri,
            block.timestamp,
            msg.sender
        );
    }

    /// @notice Get certificate by userId + wallet.
    function getCertificate(string calldata userId, address wallet) external view returns (Certificate memory) {
        bytes32 certKey = _certKey(userId, wallet);
        return certificates[certKey];
    }

    /// @notice Check if certificate exists for userId + wallet.
    function hasCertificate(string calldata userId, address wallet) external view returns (bool) {
        bytes32 certKey = _certKey(userId, wallet);
        return certificates[certKey].exists;
    }

    function _certKey(string memory userId, address wallet) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(userId, wallet));
    }

    // Lightweight address to hex string for display without pulling in a library
    function _toHexString(address account) private pure returns (string memory) {
        bytes20 data = bytes20(account);
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(2 + 40);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
          str[2 + i * 2] = alphabet[uint8(data[i] >> 4)];
          str[3 + i * 2] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
}
