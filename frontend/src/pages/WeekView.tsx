import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Target, ExternalLink } from 'lucide-react';
import Layout from '../components/Layout';
import { curriculumAPI, resourcesAPI } from '../services/api';
import { Resource } from '../types';

const WeekView: React.FC = () => {
  const { week } = useParams<{ week: string }>();
  const navigate = useNavigate();
  const [weeklyPlan, setWeeklyPlan] = useState<any>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (week) {
      loadWeekData(parseInt(week));
    }
  }, [week]);

  const handleCompleteWeek = async () => {
    if (!week) return;
    
    setCompleting(true);
    try {
      await curriculumAPI.completeWeek(parseInt(week));
      // Navigate to next week or dashboard
      const nextWeek = parseInt(week) + 1;
      window.location.href = `/week/${nextWeek}`;
    } catch (error) {
      console.error('Error completing week:', error);
      alert('Failed to complete week');
    } finally {
      setCompleting(false);
    }
  };

  const loadWeekData = async (weekNumber: number) => {
    try {
      const [weekData, curriculumData, weekStatus] = await Promise.all([
        curriculumAPI.getWeeklyPlan(weekNumber),
        curriculumAPI.get(),
        curriculumAPI.getWeekStatus(weekNumber)
      ]);
      
      setWeeklyPlan(weekData.weeklyPlan);
      setIsCompleted(weekStatus.isCompleted);
      const curriculumId = curriculumData.curriculum._id;

      // Load resources for topics in this week
      if (weekData.weeklyPlan.topicDetails) {
        const allResources: Resource[] = [];

        for (const topic of weekData.weeklyPlan.topicDetails) {
          try {
            const resourcesRes = await resourcesAPI.getTopicResources(topic.id, curriculumId);
            allResources.push(...resourcesRes.resources);
          } catch (error) {
            console.error('Error loading resources for topic:', topic.id);
          }
        }

        setResources(allResources);
      }
    } catch (error) {
      console.error('Error loading week data:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
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

  if (!weeklyPlan && !loading) {
    navigate('/dashboard');
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Week {weeklyPlan.week}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {weeklyPlan.estimatedHours} hours of learning this week
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {isCompleted ? (
              <span className="inline-flex items-center px-4 py-2 border border-green-200 text-sm font-medium rounded-md text-green-800 bg-green-100">
                ✓ Week Completed
              </span>
            ) : (
              <button
                onClick={handleCompleteWeek}
                disabled={completing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {completing ? 'Completing...' : 'Complete Week'}
              </button>
            )}
            <Link
              to="/dashboard"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Week Goals */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              This Week's Goals
            </h3>
            <ul className="space-y-2">
              {weeklyPlan.goals.map((goal: string, index: number) => (
                <li key={index} className="flex items-start">
                  <Target className="h-5 w-5 text-primary-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Topics */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Topics to Cover
            </h3>
            <div className="space-y-4">
              {weeklyPlan.topicDetails?.map((topic: any) => (
                <div key={topic.id} className={`border rounded-lg p-4 transition-colors ${
                  topic.isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        topic.isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {topic.isCompleted ? '✓' : '○'}
                      </div>
                      <h4 className={`text-md font-medium ${
                        topic.isCompleted ? 'text-green-900' : 'text-gray-900'
                      }`}>{topic.title}</h4>
                      {topic.isCompleted && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium ${
                        topic.isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {topic.completedSubtopics}/{topic.totalSubtopics} lessons
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        topic.difficulty === 'beginner' ? 'bg-blue-100 text-blue-800' :
                        topic.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {topic.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                  
                  {/* Subtopics */}
                  <div className="space-y-2">
                    {topic.subtopics.map((subtopic: any) => (
                      <div key={subtopic.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">{subtopic.title}</h5>
                          <p className="text-xs text-gray-500">{subtopic.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">{subtopic.estimatedHours}h</span>
                          <Link
                            to={`/lesson/${subtopic.id}`}
                            state={{ subtopic: { title: subtopic.title, description: subtopic.description } }}
                            className="text-primary-600 hover:text-primary-500 text-xs font-medium"
                          >
                            Start →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resources */}
        {resources.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recommended Resources
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {resources.slice(0, 6).map((resource) => (
                  <div key={resource._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            resource.type === 'book' ? 'bg-blue-100 text-blue-800' :
                            resource.type === 'course' ? 'bg-green-100 text-green-800' :
                            resource.type === 'article' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {resource.type}
                          </span>
                          <span className="text-xs text-gray-500">{resource.level}</span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">{resource.title}</h4>
                        {resource.authorOrSource && (
                          <p className="text-xs text-gray-500 mb-2">by {resource.authorOrSource}</p>
                        )}
                        <p className="text-xs text-gray-600 mb-2">{resource.description}</p>
                        <p className="text-xs text-gray-500 italic">{resource.reason}</p>
                        {resource.url && resource.url !== '#' && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:text-primary-500 mt-2 inline-flex items-center"
                          >
                            View Resource
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </div>
                      {resource.url && resource.url !== '#' && (
                        <ExternalLink className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WeekView;