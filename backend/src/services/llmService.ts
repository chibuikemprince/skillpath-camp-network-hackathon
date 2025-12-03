import axios from 'axios';
import { Module, Question, Resource } from '../types';

interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class LLMService {
  private apiUrl: string;
  private apiKey: string;
  private modelName: string;

  constructor() {
    this.apiUrl = process.env.AI_MODEL_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
    this.apiKey = process.env.AI_MODEL_API_KEY || '';
    this.modelName = process.env.AI_MODEL_NAME || 'gpt-3.5-turbo';

  console.log({
    MONGODB_URI: process.env.MONGODB_URI 
  })

  }


  private async callLLM(prompt: string, retries: number = 3): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.post<LLMResponse>(
          this.apiUrl,
          {
            model: this.modelName,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000,
            temperature: 0.7
          },
          {
            headers: {

              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer':  `http://localhost:${process.env.PORT}`,
              'X-Title': 'SkillPath'
            }
          }
        );
        return response.data.choices[0].message.content;
      } catch (error) {
        console.error(`LLM API Error (attempt ${attempt}/${retries}):`, error);
        if (attempt === retries) {
          throw new Error('Failed to generate content after 3 attempts');
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    }
    throw new Error('Failed to generate content');
  }

  async generateCurriculum(skill: string, level: string, timePerWeek: number): Promise<{ modules: Module[], weeklyRoadmap: any[] }> {
    const prompt = `Create a comprehensive curriculum for learning "${skill}" at ${level} level with ${timePerWeek} hours per week.

Return a JSON object with:
1. "modules": Array of modules, each with:
   - id: unique string
   - title: module name
   - description: brief description
   - estimatedWeeks: number of weeks calculated with the considration of ${timePerWeek} hours per week
   - topics: array of topics, each with:
     - id: unique string
     - title: topic name
     - description: brief description
     - difficulty: "beginner"|"intermediate"|"advanced"
     - subtopics: array with id, title, description, estimatedHours

2. "weeklyRoadmap": Array of weekly plans with:
   - week: number (1 to last week)
   - topics: array of topic IDs to cover
   - estimatedHours: total hours for the week
   - goals: array of learning goals
3. "total-estimated-weeks": Total number of weeks (sum of all module estimatedWeeks)  

CRITICAL: Sum all module estimatedWeeks (e.g., if the estimatedWeeks for Module1 is 2 weeks,  estimatedWeeks for Module2 is 3 weeks and estimatedWeeks for Module3 is 3 weeks, then total estimatedWeeks for the curricullum is  8 total weeks). Create weeklyRoadmap with exactly this total number of estimatedWeeks (week 1 to week 8). Distribute topics progressively across these weeks.`;

    try {
      const response = await this.callLLM(prompt);
      console.log({response})
      return JSON.parse(response);
    } catch {
      return this.getFallbackCurriculum(skill, level, 12);
    }
  }

  async generateLesson(subtopic: { title: string, description: string }, skill: string, level: string): Promise<any> {
    const prompt = `Create a lesson for "${subtopic.title}" in ${skill} for ${level} level.

Subtopic context: ${subtopic.description}

Return JSON with:
- title: lesson title
- objective: what student will learn
- content: detailed explanation (300-500 words)
- examples: array of 2-3 practical example strings
- practiceTask: hands-on task for the student

Make it engaging and practical.`;

    try {
      const response = await this.callLLM(prompt);
      console.log({response: JSON.parse(response)})
      return JSON.parse(response);
    } catch {
      return this.getFallbackLesson(subtopic.title);
    }
  }

  async generateQuiz(lessonTitle: string, content: string): Promise<Question[]> {
    const prompt = `Create 5 multiple choice questions for a lesson titled "${lessonTitle}".

Return JSON array of questions, each with:
- id: unique string
- text: question text
- options: array of 4 answer choices
- correctAnswer: index (0-3) of correct answer
- explanation: why the answer is correct

Base questions on this content: ${content.substring(0, 500)}...`;

    try {
      const response = await this.callLLM(prompt);
      return JSON.parse(response);
    } catch {
      return this.getFallbackQuiz(lessonTitle);
    }
  }

 async generateResources(topicTitle: string, skill: string, level: string, preferredStyle: string = "mixed"): Promise<Resource[]> {
  let resourceTypeText: string;
  switch (preferredStyle) {
    case 'mixed':
      resourceTypeText = 'mix of books, courses, articles, and videos';
      break;
    case 'text':
      resourceTypeText = 'books, courses, and articles only';
      break;
    case 'video':
      resourceTypeText = 'videos and courses only';
      break;
    case 'books':
      resourceTypeText = 'books and courses only';
      break;
    case 'articles':
      resourceTypeText = 'articles and courses only';
      break;
    case 'videos':
      resourceTypeText = 'videos and courses only';
      break;
    case 'courses':
      resourceTypeText = 'courses only';
      break;
    default:
      resourceTypeText = 'mix of books, courses, articles, and videos';
  }

  const prompt = `Suggest 8-10 learning resources for "${topicTitle}" in ${skill} for ${level} level.

Return JSON array with ${resourceTypeText}. Each resource:
- type: "book"|"course"|"article"|"video"
- title: resource title
- authorOrSource: author or platform name
- level: "beginner"|"intermediate"|"advanced"
- estimatedTime: time to complete
- reason: why recommended (1 sentence)
- description: brief description
- url: valid URL or "#" if no valid URL available

IMPORTANT: Only provide real, valid URLs. If you don't have a valid URL, use "#" instead. Do not use placeholder URLs like example.com.
Include both free and paid options.`;

  console.log({preferredStyle, resourceTypeText, prompt})

  try {
    const response = await this.callLLM(prompt);
    return JSON.parse(response);
  } catch {
    return this.getFallbackResources(topicTitle);
  }
}


  async generateProjects(moduleTitle: string, skill: string, level: string): Promise<any[]> {
    const prompt = `Create 2-3 project ideas for "${moduleTitle}" in ${skill} for ${level} level.

Return JSON array of projects, each with:
- title: project name
- description: what to build (2-3 sentences)
- requirements: array of key features
- techStack: array of technologies to use
- skillsDemonstrated: array of skills this project shows
- difficulty: "beginner"|"intermediate"|"advanced"

Make projects practical and portfolio-worthy.`;

    try {
      const response = await this.callLLM(prompt);
      return JSON.parse(response);
    } catch {
      return this.getFallbackProjects(moduleTitle);
    }
  }

  // Fallback methods for when AI fails
  private getFallbackCurriculum(skill: string, level: string, weeks: number = 12): any {
    const weeklyRoadmap = [];
    for (let i = 1; i <= weeks; i++) {
      weeklyRoadmap.push({
        week: i,
        topics: ['topic-1'],
        estimatedHours: 5,
        goals: [`Week ${i}: Learn ${skill} concepts`]
      });
    }
    
    return {
      modules: [{
        id: 'module-1',
        title: `${skill} Fundamentals`,
        description: `Core concepts and basics of ${skill}`,
        estimatedWeeks: weeks,
        topics: [{
          id: 'topic-1',
          title: 'Introduction',
          description: `Getting started with ${skill}`,
          difficulty: level,
          subtopics: [{
            id: 'subtopic-1',
            title: 'Overview',
            description: `What is ${skill}?`,
            estimatedHours: 2
          }]
        }]
      }],
      weeklyRoadmap
    };
  }

  private getFallbackLesson(title: string): any {
    return {
      title,
      objective: `Learn about ${title}`,
      content: `This lesson covers the fundamentals of ${title}. You'll learn key concepts and practical applications.`,
      examples: [`Basic ${title} implementation example`, `Advanced ${title} use case example`],
      practiceTask: `Practice implementing ${title} concepts`
    };
  }

  private getFallbackQuiz(title: string): Question[] {
    return [
      {
        id: 'q1',
        text: `What is the main purpose of ${title}?`,
        options: [
          `To understand the core concepts of ${title}`,
          `To memorize ${title} terminology`,
          `To skip learning fundamentals`,
          `To avoid practical application`
        ],
        correctAnswer: 0,
        explanation: `Understanding core concepts is essential for mastering ${title}.`
      },
      {
        id: 'q2',
        text: `Which approach is most effective when learning ${title}?`,
        options: [
          'Theory only without practice',
          'Practice only without theory',
          'Combining theory with hands-on practice',
          'Avoiding structured learning'
        ],
        correctAnswer: 2,
        explanation: 'Combining theoretical knowledge with practical application leads to better understanding and retention.'
      },
      {
        id: 'q3',
        text: `What is a key benefit of mastering ${title}?`,
        options: [
          'No practical applications',
          'Limited career opportunities',
          'Enhanced problem-solving skills and career prospects',
          'Decreased learning ability'
        ],
        correctAnswer: 2,
        explanation: `Mastering ${title} typically enhances your problem-solving abilities and opens up new career opportunities.`
      }
    ];
  }

  private getFallbackResources(topic: string): Resource[] {
    return [{
      topicId: 'topic-1',
      type: 'article',
      title: `${topic} Guide`,
      level: 'beginner',
      reason: 'Comprehensive introduction',
      description: `Learn ${topic} fundamentals`,
      url: '#'
    } as any];
  }

  private getFallbackProjects(module: string): any[] {
    return [{
      title: `${module} Project`,
      description: `Build a practical project using ${module} concepts`,
      requirements: ['Feature 1', 'Feature 2'],
      techStack: ['Technology 1', 'Technology 2'],
      skillsDemonstrated: ['Skill 1', 'Skill 2'],
      difficulty: 'beginner'
    }];
  }
}

export default new LLMService();