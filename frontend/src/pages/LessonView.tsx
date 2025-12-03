import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { lessonsAPI, curriculumAPI } from '../services/api';
import { Lesson, Quiz, QuizResult } from '../types';

const LessonView: React.FC = () => {
  const { subtopicId } = useParams<{ subtopicId: string }>();
  const location = useLocation();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    if (subtopicId) {
      loadLesson();
    }
  }, [subtopicId]);

  const loadLesson = async () => {
    try {
      setError(null);
      const curriculumData = await curriculumAPI.get();
      const curriculumId = curriculumData.curriculum._id;
      
      // Get subtopic details from location state or find in curriculum
      let subtopicDetails = (location.state as any)?.subtopic;
      
      if (!subtopicDetails) {
        // Find subtopic in curriculum if not passed via state
        const curriculum = curriculumData.curriculum;
        for (const module of curriculum.modules) {
          for (const topic of module.topics) {
            const subtopic = topic.subtopics.find((s: any) => s.id === subtopicId);
            if (subtopic) {
              subtopicDetails = { title: subtopic.title, description: subtopic.description };
              break;
            }
          }
          if (subtopicDetails) break;
        }
      }
      
      if (!subtopicDetails) {
        throw new Error('Subtopic details not found');
      }
      
      const response = await lessonsAPI.generateLesson(subtopicId!, curriculumId, subtopicDetails);
      
      if (response.lesson) {
        setLesson(response.lesson);
        
        // Load quiz for this lesson
        if (response.lesson._id) {
          try {
            const quizResponse = await lessonsAPI.getQuiz(response.lesson._id);
            setQuiz(quizResponse.quiz);
            setSelectedAnswers(new Array(quizResponse.quiz.questions.length).fill(-1));
          } catch (error) {
            console.error('Error loading quiz:', error);
          }
        }
      } else {
        setError('Lesson could not be generated');
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      setError('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const submitQuiz = async () => {
    if (!quiz || selectedAnswers.includes(-1)) return;
    
    setQuizLoading(true);
    try {
      const result = await lessonsAPI.submitQuiz(quiz._id, selectedAnswers);
      setQuizResult(result);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setQuizLoading(false);
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

  if (!lesson) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">
            {error || 'Lesson not found'}
          </h3>
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-500">
            Back to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  if (!lesson) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{lesson.objective}</p>
          </div>
          <Link
            to="/dashboard"
            className="text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Lesson Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {lesson.content}
              </div>
            </div>
          </div>
        </div>

        {/* Examples */}
        {lesson.examples && lesson.examples.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Examples
              </h3>
              <div className="space-y-4">
                {lesson.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Practice Task */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Practice Task
            </h3>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex">
                <BookOpen className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  {lesson.practiceTask}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz */}
        {quiz && !quizResult && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Knowledge Check
              </h3>
              <div className="space-y-6">
                {quiz.questions.map((question, questionIndex) => (
                  <div key={question.id} className="space-y-3">
                    <h4 className="text-md font-medium text-gray-900">
                      {questionIndex + 1}. {question.text}
                    </h4>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className="flex items-center space-x-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            value={optionIndex}
                            checked={selectedAnswers[questionIndex] === optionIndex}
                            onChange={() => handleAnswerSelect(questionIndex, optionIndex)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button
                  onClick={submitQuiz}
                  disabled={selectedAnswers.includes(-1) || quizLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {quizLoading ? 'Submitting...' : 'Submit Quiz'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Results */}
        {quizResult && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Quiz Results
                </h3>
                <div className={`text-2xl font-bold ${
                  quizResult.score >= 70 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {quizResult.score}%
                </div>
              </div>
              
              <div className={`p-4 rounded-lg mb-4 ${
                quizResult.score >= 70 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm ${
                  quizResult.score >= 70 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {quizResult.message}
                </p>
              </div>

              <div className="space-y-4">
                {quizResult.results.map((result, index) => (
                  <div key={result.questionId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      {result.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Question {index + 1}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {result.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Continue Learning
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LessonView;