import { buildCertificateJson, CourseInfo, PerformanceInfo, ProjectInfo } from './certificateBuilder';

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function mintProofOfLearning({
  auth,
  learnerWallet,
  learnerName,
  course,
  performance,
  project,
}: {
  auth: any;
  learnerWallet: string;
  learnerName: string;
  course: CourseInfo;
  performance: PerformanceInfo;
  project?: ProjectInfo;
}) {
  // 1. Build JSON object
  const certificateJson = buildCertificateJson({
    walletAddress: learnerWallet,
    displayName: learnerName,
    course,
    performance,
    project,
  });

  // 2. Convert JSON → File
  const blob = new Blob([JSON.stringify(certificateJson, null, 2)], {
    type: "application/json",
  });

  const fileName = `pol-${course.id}-${learnerWallet}-${Date.now()}.json`;

  const file = new File([blob], fileName, {
    type: "application/json",
  });

  // 3. Define license terms (free access)
  const license = {
    price: BigInt(0),
    duration: 60 * 60 * 24 * 365, // 1 year access
    royaltyBps: 0,
    paymentToken: ZERO_ADDRESS,
  };

  // 4. Define metadata for the NFT
  const metadata = {
    name: `Proof of Learning – ${course.title}`,
    description: `On-chain completion certificate for ${course.title}`,
    learnerWallet,
    courseId: course.id,
    type: "proof-of-learning-certificate",
  };

  // 5. Mint the NFT
  const result = await auth.origin.mintFile(file, metadata, license);

  return result;
}