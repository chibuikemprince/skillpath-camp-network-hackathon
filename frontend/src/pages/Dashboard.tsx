import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Target, TrendingUp, Play } from 'lucide-react';
import Layout from '../components/Layout';
import CertificateSection from '../components/CertificateSection';
import { curriculumAPI } from '../services/api';
import { Dashboard as DashboardType, Curriculum } from '../types';

const Dashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardType | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dashboardRes, curriculumRes] = await Promise.all([
        curriculumAPI.getDashboard().catch(() => null),
        curriculumAPI.get().catch(() => null)
      ]);
      
      if (dashboardRes) setDashboard(dashboardRes.dashboard);
      if (curriculumRes) setCurriculum(curriculumRes.curriculum);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCurriculum = async () => {
    setGenerating(true);
    try {
      const response = await curriculumAPI.create();
      setCurriculum(response.curriculum);
      await loadDashboard();
    } catch (error) {
      console.error('Error generating curriculum:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!curriculum) {
    return (
      <Layout>
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No curriculum yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by generating your personalized learning curriculum.
          </p>
          <div className="mt-6">
            <button
              onClick={generateCurriculum}
              disabled={generating}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate My Learning Plan'}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your progress in {curriculum.skill}
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Overall Progress
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboard?.overallProgress || 0}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Current Week
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Week {dashboard?.currentWeek || 1}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Lessons Completed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboard?.completedLessons || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Quizzes Completed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboard?.completedQuizzes || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All Weeks */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Learning Progress
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: dashboard?.totalWeeks || 0 }, (_, i) => {
                const weekNumber = i + 1;
                const isCompleted = dashboard?.completedWeeks?.includes(weekNumber);
                const isCurrent = weekNumber === dashboard?.currentWeek;
                const isAccessible = isCompleted || isCurrent;
                
                return (
                  <div
                    key={weekNumber}
                    className={`p-4 rounded-lg border-2 ${
                      isCompleted
                        ? 'border-green-200 bg-green-50'
                        : isCurrent
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Week {weekNumber}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Locked'}
                        </p>
                      </div>
                      <div>
                        {isCompleted && (
                          <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {isCurrent && (
                          <Link
                            to={`/week/${weekNumber}`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Continue
                          </Link>
                        )}
                        {!isAccessible && (
                          <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                            <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    {isAccessible && (
                      <div className="mt-2">
                        <Link
                          to={`/week/${weekNumber}`}
                          className="text-xs text-primary-600 hover:text-primary-500"
                        >
                          View Week →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Certificate Section */}
        <CertificateSection curriculumId={curriculum._id} />

        {/* Curriculum Overview */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Learning Path: {curriculum.skill}
            </h3>
            <div className="mt-4 space-y-3">
              {curriculum.modules.map((module) => (
                <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{module.title}</h4>
                    <p className="text-sm text-gray-500">{module.description}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {module.estimatedWeeks} weeks
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;