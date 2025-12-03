import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BookOpen } from 'lucide-react';
import { authAPI } from '../services/api';
import { setToken, setUser } from '../utils/auth';

interface RegisterForm {
  email: string;
  password: string;
  profile: {
    targetSkill: string;
    currentLevel: 'beginner' | 'intermediate' | 'advanced';
    timePerWeek: number;
    goalType: 'job-ready' | 'exam' | 'hobby' | 'other';
    preferredStyle: 'text' | 'video' | 'mixed';
  };
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.register(data);
      setToken(response.token);
      setUser(response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <BookOpen className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your SkillFoundry account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">What do you want to learn?</label>
              <input
                {...register('profile.targetSkill', { required: 'Target skill is required' })}
                type="text"
                placeholder="e.g., Web Development, Python, UI Design"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.profile?.targetSkill && <p className="mt-1 text-sm text-red-600">{errors.profile.targetSkill.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Level</label>
              <select
                {...register('profile.currentLevel', { required: 'Level is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select your level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {errors.profile?.currentLevel && <p className="mt-1 text-sm text-red-600">{errors.profile.currentLevel.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Hours per week</label>
              <select
                {...register('profile.timePerWeek', { required: 'Time commitment is required', valueAsNumber: true })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select hours per week</option>
                <option value={3}>3 hours</option>
                <option value={5}>5 hours</option>
                <option value={10}>10 hours</option>
                <option value={15}>15 hours</option>
                <option value={20}>20+ hours</option>
              </select>
              {errors.profile?.timePerWeek && <p className="mt-1 text-sm text-red-600">{errors.profile.timePerWeek.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Goal</label>
              <select
                {...register('profile.goalType', { required: 'Goal is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select your goal</option>
                <option value="job-ready">Job Ready</option>
                <option value="exam">Exam Preparation</option>
                <option value="hobby">Personal Interest</option>
                <option value="other">Other</option>
              </select>
              {errors.profile?.goalType && <p className="mt-1 text-sm text-red-600">{errors.profile.goalType.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Learning Style</label>
              <select
                {...register('profile.preferredStyle', { required: 'Learning style is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select preferred style</option>
                <option value="text">Text-based</option>
                <option value="video">Video-based</option>
                <option value="mixed">Mixed Content</option>
              </select>
              {errors.profile?.preferredStyle && <p className="mt-1 text-sm text-red-600">{errors.profile.preferredStyle.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;