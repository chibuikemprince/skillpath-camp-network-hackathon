export interface CourseInfo {
  id: string;
  title: string;
  module: string;
  level: string;
}

export interface PerformanceInfo {
  completionPercent: number;
  masteryScore: number;
  hoursStudied: number;
  quizzesPassed: number;
  projectsCompleted: number;
}

export interface ProjectInfo {
  id: string;
  title: string;
  repoUrl?: string;
  demoUrl?: string;
}

export function buildCertificateJson(params: {
  walletAddress: string;
  displayName: string;
  course: CourseInfo;
  performance: PerformanceInfo;
  project?: ProjectInfo;
}) {
  const { walletAddress, displayName, course, performance, project } = params;

  return {
    type: "proof-of-learning",
    learner: {
      walletAddress,
      displayName,
    },
    course,
    performance,
    project: project ?? null,
    issued: {
      issuedByApp: "SkillPath",
      issuedAt: new Date().toISOString(),
      version: "1.0.0",
    },
  };
}