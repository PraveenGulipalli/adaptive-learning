import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Mic,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Clock,
  User,
  Bot,
  Volume2,
  VolumeX,
  Settings,
  CheckCircle,
  ArrowLeft,
  Download,
  Loader2,
  Sparkles,
  Brain,
  X,
  AlertCircle,
  Target
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

// Domain and hobby mappings from your existing system
const DOMAINS = {
  "engineering-student": {
    label: "🔧 Engineering Student",
    keywords: ["circuits", "code snippets", "algorithms", "systems", "programming"]
  },
  "medical-student": {
    label: "🏥 Medical Student", 
    keywords: ["case studies", "healthcare", "diagnosis", "treatment", "anatomy"]
  },
  "business-student": {
    label: "💼 Business Student",
    keywords: ["marketing", "finance", "strategy", "management", "economics"]
  },
  "teacher-trainer": {
    label: "👨‍🏫 Teacher / Trainer",
    keywords: ["classroom", "pedagogy", "curriculum", "assessment", "learning"]
  },
  "working-professional": {
    label: "💻 Working Professional",
    keywords: ["workplace", "project management", "leadership", "productivity", "career"]
  }
};

const HOBBIES = {
  "cricket": {
    label: "🏏 Cricket",
    keywords: ["team strategy", "performance", "coaching", "statistics"]
  },
  "movies": {
    label: "🎬 Movie Buff",
    keywords: ["storytelling", "character development", "plot", "direction"]
  },
  "gaming": {
    label: "🎮 Gamer", 
    keywords: ["strategy", "problem solving", "levels", "achievements"]
  },
  "music": {
    label: "🎵 Music Lover",
    keywords: ["rhythm", "harmony", "composition", "performance"]
  },
  "cooking": {
    label: "👨‍🍳 Chef",
    keywords: ["recipe", "ingredients", "technique", "presentation"]
  }
};

// AI Configuration
const AI_CONFIG = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
  model: 'gemini-1.5-flash'
};

// AI-powered question generation
const generateQuestionsWithAI = async (topic, domain, hobby, difficulty, numQuestions, customContext = '', assetContent = '', assetTitle = '') => {
  
  if (!AI_CONFIG.apiKey) {
    console.warn('Google API key not found. Using fallback questions.');
    return generateFallbackQuestions(topic, domain, hobby, difficulty, numQuestions);
  }

  try {
    const domainContext = DOMAINS[domain]?.keywords?.join(', ') || 'general knowledge';
    const hobbyContext = HOBBIES[hobby]?.keywords?.join(', ') || 'general interests';
    
    // Clean and truncate asset content to avoid token limits - comprehensive HTML stripping
    const cleanContent = assetContent
      // Remove all HTML tags (including self-closing and nested)
      .replace(/<[^>]*>/g, '')
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove script and style content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove markdown formatting
      .replace(/[#*`_~]/g, '')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&hellip;/g, '...')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Remove extra spaces around punctuation
      .replace(/\s+([,.!?;:])/g, '$1')
      .trim()
      .substring(0, 2000); // Limit to 2000 characters to avoid token limits
    
    const hasContent = cleanContent.length > 50; // Check if we have meaningful content
    
    // Safety check - if we claim to have content but it's mostly empty, force fallback
    if (hasContent && cleanContent.trim().length < 100) {
      console.warn('Content too short, falling back to generic questions');
      return generateFallbackQuestions(topic, domain, hobby, difficulty, numQuestions);
    }
    
    // Get current time for context
    const currentTime = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
    

    const prompt = hasContent ? 
      `You are an expert technical interviewer. You MUST generate ${numQuestions} ${difficulty} level interview questions STRICTLY based on the learning content provided below. DO NOT generate generic questions.

===== LEARNING CONTENT TO BASE QUESTIONS ON =====
Title: "${assetTitle}"

Content: "${cleanContent}"
===== END OF LEARNING CONTENT =====

Context:
- Current Time: ${currentTime}
- Candidate Domain: ${DOMAINS[domain]?.label} (Keywords: ${domainContext})
- Candidate Hobby: ${HOBBIES[hobby]?.label} (Keywords: ${hobbyContext})
- Additional Context: ${customContext}

CRITICAL INSTRUCTIONS:
1. READ the learning content above carefully
2. Generate questions ONLY about concepts, terms, examples, and topics mentioned in that specific content
3. DO NOT ask generic questions about the subject area
4. Each question MUST reference something specific from the provided content
5. Test understanding of the exact material provided

For each question, provide:
1. A specific interview question that directly tests knowledge from the learning content above
2. A sample answer that uses information from the content and incorporates domain/hobby analogies

Format as JSON array:
[
  {
    "question": "Based on the content, [specific question about content]",
    "sampleAnswer": "According to the learning material, [answer using content info with analogies]",
    "topicArea": "Specific concept from the provided content",
    "difficulty": "${difficulty}"
  }
]

EXAMPLE (if content was about "Neural Networks learn patterns"):
{
  "question": "According to the lesson content, how do neural networks learn patterns from data?",
  "sampleAnswer": "As explained in the content, neural networks learn patterns by analyzing training data and adjusting weights. For ${DOMAINS[domain]?.label}, this is like...",
  "topicArea": "Neural Network Learning Process",
  "difficulty": "${difficulty}"
}

Generate ${numQuestions} questions NOW that are SPECIFICALLY about the content provided above:`
      :
      `You are an expert technical interviewer. Generate ${numQuestions} ${difficulty} level interview questions about ${topic}.

Context:
- Current Time: ${currentTime}
- Candidate Domain: ${DOMAINS[domain]?.label} (Keywords: ${domainContext})
- Candidate Hobby: ${HOBBIES[hobby]?.label} (Keywords: ${hobbyContext})
- Additional Context: ${customContext}

For each question, provide:
1. A clear, specific interview question
2. A detailed sample answer that incorporates analogies or examples from the candidate's domain and hobby when appropriate

Format your response as a JSON array where each object has:
{
  "question": "The interview question",
  "sampleAnswer": "Detailed answer with domain/hobby context when relevant",
  "topicArea": "Specific area this question covers",
  "difficulty": "${difficulty}"
}

Make the questions progressively challenging and cover different aspects of ${topic}. 
Include practical scenarios and real-world applications.
When possible, use analogies from ${HOBBIES[hobby]?.label} or examples relevant to ${DOMAINS[domain]?.label}.

Generate ${numQuestions} questions now:`;


    // Use Google Generative AI API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.model}:generateContent?key=${AI_CONFIG.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more focused, instruction-following responses
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 4000,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error response:', errorText);
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated from AI');
    }

    // Parse the JSON response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }

      const questions = JSON.parse(jsonMatch[0]);
      
      // Validate that questions are content-based if we have content
      if (hasContent) {
        questions.forEach((q, i) => {
          // Check if question seems generic vs content-specific
          const isGeneric = q.question.toLowerCase().includes('what is') && 
                           !q.question.toLowerCase().includes('content') && 
                           !q.question.toLowerCase().includes('lesson') &&
                           !q.question.toLowerCase().includes('according to');
          if (isGeneric) {
            console.warn(`Question ${i + 1} appears generic, should be content-specific`);
          }
        });
      }
      
      return questions.map(q => ({
        question: q.question,
        sampleAnswer: q.sampleAnswer,
        topicArea: q.topicArea || topic,
        difficulty: q.difficulty || difficulty
      }));

  } catch (error) {
    console.error('AI question generation failed:', error);
    return generateFallbackQuestions(topic, domain, hobby, difficulty, numQuestions);
  }
};

// Fallback question generation when AI is not available - Generative AI focused
const generateFallbackQuestions = (topic, domain, hobby, difficulty, numQuestions) => {
  const fallbackQuestions = {
    "generative-ai": [
      { q: "What is Generative AI and how does it differ from traditional AI?", area: "Fundamentals" },
      { q: "Explain how large language models like GPT work at a high level.", area: "Architecture" },
      { q: "What are the key components of a transformer architecture?", area: "Neural Networks" },
      { q: "How does the attention mechanism work in transformer models?", area: "Core Concepts" },
      { q: "What is prompt engineering and why is it important?", area: "Practical Applications" },
      { q: "Explain the concept of fine-tuning in generative AI models.", area: "Model Training" },
      { q: "What are the main challenges and limitations of current generative AI?", area: "Limitations" },
      { q: "How do you evaluate the quality of generated content?", area: "Evaluation" },
      { q: "What is the difference between supervised and unsupervised learning in AI?", area: "Learning Paradigms" },
      { q: "Explain the concept of tokenization in language models.", area: "Text Processing" }
    ],
    "ai-fundamentals": [
      { q: "What is machine learning and how does it relate to AI?", area: "ML Basics" },
      { q: "Explain the difference between deep learning and traditional machine learning.", area: "Deep Learning" },
      { q: "What are neural networks and how do they learn?", area: "Neural Networks" },
      { q: "How does backpropagation work in training neural networks?", area: "Training" },
      { q: "What is overfitting and how can you prevent it?", area: "Model Performance" }
    ],
    "nlp": [
      { q: "What is natural language processing and its main applications?", area: "NLP Fundamentals" },
      { q: "Explain word embeddings and their role in NLP.", area: "Text Representation" },
      { q: "How do sequence-to-sequence models work?", area: "Sequence Models" },
      { q: "What is the difference between BERT and GPT architectures?", area: "Model Comparison" },
      { q: "How do you handle different languages in NLP models?", area: "Multilingual NLP" }
    ]
  };

  const topicQuestions = fallbackQuestions[topic] || fallbackQuestions["generative-ai"];
  const selectedQuestions = topicQuestions.slice(0, numQuestions);
  
  return selectedQuestions.map(item => ({
    question: item.q,
    sampleAnswer: generateContextualAnswer(item.q, topic, domain, hobby, difficulty),
    topicArea: item.area,
    difficulty: difficulty
  }));
};

const generateContextualAnswer = (question, topic, domain, hobby, difficulty) => {
  const domainContext = DOMAINS[domain]?.keywords?.[0] || 'technical concepts';
  const hobbyContext = HOBBIES[hobby]?.keywords?.[0] || 'strategic thinking';
  
  // Generate contextual answers for Generative AI questions
  if (question.includes("Generative AI") || question.includes("generative AI")) {
    return `Generative AI is a subset of artificial intelligence that can create new content, including text, images, audio, and code. Unlike traditional AI that analyzes existing data, generative AI produces original outputs. For ${DOMAINS[domain]?.label}, this technology is revolutionizing how we approach problem-solving and content creation. Think of it like ${hobbyContext} - just as ${hobbyContext} involves creating something new from existing knowledge and skills, generative AI creates novel outputs by learning patterns from vast amounts of training data.`;
  }
  
  if (question.includes("transformer") || question.includes("attention mechanism")) {
    return `Transformers are a type of neural network architecture that revolutionized natural language processing. The attention mechanism allows the model to focus on relevant parts of the input when generating output. For ${DOMAINS[domain]?.label}, understanding transformers is crucial for working with modern AI systems. This is similar to ${hobbyContext} - just as ${hobbyContext} requires focusing attention on key elements to achieve the best results, transformers use attention to focus on the most relevant information when processing language.`;
  }
  
  if (question.includes("prompt engineering")) {
    return `Prompt engineering is the practice of crafting effective inputs to get desired outputs from AI models. It involves understanding how to structure questions and instructions to maximize the quality and relevance of AI responses. For ${DOMAINS[domain]?.label}, this skill is essential for effectively using AI tools. Think of it like ${hobbyContext} - just as ${hobbyContext} requires clear communication and strategic thinking to achieve goals, prompt engineering requires clear, strategic communication with AI systems to get the best results.`;
  }
  
  if (question.includes("fine-tuning")) {
    return `Fine-tuning is the process of adapting a pre-trained AI model to perform specific tasks by training it on additional, task-specific data. This allows the model to maintain its general knowledge while becoming specialized for particular use cases. For ${DOMAINS[domain]?.label}, fine-tuning enables customization of AI models for specific applications. This approach is similar to ${hobbyContext} - just as ${hobbyContext} involves building on existing skills and adapting them to specific situations, fine-tuning builds on pre-trained knowledge and adapts it for specific tasks.`;
  }
  
  // Generic fallback for other AI questions
  return `This is a ${difficulty} level question about ${topic}. For ${DOMAINS[domain]?.label}, understanding this concept is crucial for working effectively with AI systems. The approach is similar to ${hobbyContext} - it requires both theoretical knowledge and practical application to master these advanced technologies.`;
};

const MockInterviewGenerator = ({ onBack, assetTopic = "general", assetContent = "", assetTitle = "" }) => {
  const [selectedTopic, setSelectedTopic] = useState(assetTopic);
  const [selectedDomain, setSelectedDomain] = useState("engineering-student");
  const [selectedHobby, setSelectedHobby] = useState("movies");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [customTopics, setCustomTopics] = useState("");
  
  const [interviewState, setInterviewState] = useState("setup"); // setup, generating, active, completed
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentUserAnswer, setCurrentUserAnswer] = useState("");
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    } else if (!isTimerRunning && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  // Effect to start first question when interview becomes active and questions are available
  useEffect(() => {
    if (interviewState === "active" && questions.length > 0 && currentQuestionIndex === 0) {
      setTimeout(() => {
        if (questions[0]) {
          speakText(questions[0]);
        }
      }, 500);
    }
  }, [interviewState, questions, currentQuestionIndex]);

  // Simple text-to-speech function with aggressive cancellation
  const speakText = (text, voice = "interviewer") => {
    
    if (!audioEnabled || !window.speechSynthesis) {
      console.error('Audio disabled or speech synthesis not available');
      return;
    }
    
    // Aggressively stop any current speech
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    
    // Wait longer for complete cancellation
    setTimeout(() => {
      // Double-check and stop again
      window.speechSynthesis.cancel();
      
      // Wait a bit more
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        
        // Try to set different voices for interviewer vs candidate
        if (voice === "interviewer" && voices.length > 0) {
          utterance.voice = voices.find(v => v.name.includes('Male')) || voices[0];
          utterance.pitch = 0.9;
          utterance.rate = 0.8;
        } else if (voice === "candidate" && voices.length > 1) {
          utterance.voice = voices.find(v => v.name.includes('Female')) || voices[1] || voices[0];
          utterance.pitch = 1.1;
          utterance.rate = 0.9;
        }
        
        utterance.onstart = () => {
          setIsPlaying(true);
        };
        utterance.onend = () => {
          setIsPlaying(false);
        };
        utterance.onerror = (error) => {
          console.error('Speech error:', error);
          setIsPlaying(false);
        };
        
        window.speechSynthesis.speak(utterance);
      }, 200);
    }, 300);
  };

  // Text-to-speech function with callback when finished
  const speakTextWithCallback = (text, callback, voice = "interviewer") => {
    if (!audioEnabled || !window.speechSynthesis) return;
    
    // Stop any current speech immediately
    window.speechSynthesis.cancel();
    
    // Wait a moment for cancellation to complete
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      // Try to set different voices for interviewer vs candidate
      if (voice === "interviewer" && voices.length > 0) {
        utterance.voice = voices.find(v => v.name.includes('Male')) || voices[0];
        utterance.pitch = 0.9;
        utterance.rate = 0.8;
      } else if (voice === "candidate" && voices.length > 1) {
        utterance.voice = voices.find(v => v.name.includes('Female')) || voices[1] || voices[0];
        utterance.pitch = 1.1;
        utterance.rate = 0.9;
      }
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        // Call the callback when speech finishes
        if (callback) {
          setTimeout(callback, 200); // Small delay before callback
        }
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        // Call callback even on error
        if (callback) {
          setTimeout(callback, 200);
        }
      };
      
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const generateQuestions = async (isRetry = false) => {
    setIsGeneratingQuestions(true);
    if (!isRetry) {
      setGenerationError(null);
      setRetryCount(0);
    }
    
    try {
      
      // Use AI to generate questions dynamically
      const aiQuestions = await generateQuestionsWithAI(
        selectedTopic, 
        selectedDomain, 
        selectedHobby, 
        difficulty, 
        numQuestions, 
        customTopics.trim(),
        assetContent,
        assetTitle
      );
      
      const questionTexts = aiQuestions.map(q => q.question);
      const answerTexts = aiQuestions.map(q => q.sampleAnswer);
      
      setQuestions(questionTexts);
      setAnswers(answerTexts);
      setUserAnswers(new Array(questionTexts.length).fill(""));
      
      // Reset retry count on success
      setRetryCount(0);
      return true; // Success
      
    } catch (error) {
      console.error('Question generation failed:', error);
      
      // Use fallback questions immediately on first failure for testing
      setGenerationError('AI generation failed. Using fallback questions instead.');
      
      // Use the improved fallback questions
      const fallbackQuestions = generateFallbackQuestions(
        selectedTopic, 
        selectedDomain, 
        selectedHobby, 
        difficulty, 
        numQuestions
      );
      
      const questionTexts = fallbackQuestions.map(q => q.question);
      const answerTexts = fallbackQuestions.map(q => q.sampleAnswer);
      
      setQuestions(questionTexts);
      setAnswers(answerTexts);
      setUserAnswers(new Array(questionTexts.length).fill(""));
      return true; // Success with fallback
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const startInterview = async () => {
    // Set default values for domain and hobby
    const defaultDomain = selectedDomain || "engineering-student";
    const defaultHobby = selectedHobby || "movies";
    
    setSelectedDomain(defaultDomain);
    setSelectedHobby(defaultHobby);
    
    setInterviewState("generating");
    const success = await generateQuestions();
    
    if (success) {
      setInterviewState("active");
      setCurrentQuestionIndex(0);
      setTimer(0);
      setIsTimerRunning(true);
      // First question will be triggered by useEffect when questions state updates
    } else {
      // This should never happen now due to retry logic and fallbacks
      setInterviewState("setup");
      setGenerationError("Unable to start interview. Please try again.");
    }
  };

  const nextQuestion = () => {
    // Save current answer
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = currentUserAnswer;
    setUserAnswers(newUserAnswers);
    setCurrentUserAnswer("");
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeout(() => {
        speakText(questions[currentQuestionIndex + 1]);
      }, 500);
    } else {
      // Interview completed
      setInterviewState("completed");
      setIsTimerRunning(false);
      setTimeout(() => {
        speakText("Congratulations! You have completed your mock interview. You can now review your answers and the sample responses.");
      }, 500);
    }
  };

  const restartInterview = () => {
    setInterviewState("setup");
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setAnswers([]);
    setUserAnswers([]);
    setCurrentUserAnswer("");
    setTimer(0);
    setIsTimerRunning(false);
    stopSpeech();
  };

  const handleExitInterview = () => {
    if (interviewState === "active" && currentQuestionIndex > 0) {
      const confirmExit = window.confirm(
        "Are you sure you want to exit the interview? Your progress will be lost."
      );
      if (confirmExit) {
        stopSpeech();
        setIsTimerRunning(false);
        onBack();
      }
    } else {
      onBack();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  const downloadResults = () => {
    const results = {
      topic: selectedTopic,
      domain: selectedDomain,
      hobby: selectedHobby,
      difficulty: difficulty,
      duration: formatTime(timer),
      interviewType: "Audio-Only AI Generated",
      note: "Questions were delivered via audio only for authentic interview experience",
      questions: questions.map((q, i) => ({
        questionNumber: i + 1,
        question: q,
        userAnswer: userAnswers[i] || "No answer provided",
        aiSampleAnswer: answers[i],
        deliveryMethod: "Audio Only"
      }))
    };
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `audio-interview-${selectedTopic}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (interviewState === "setup") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Volume2 className="w-8 h-8 text-blue-600" />
              Audio-Only Mock Interview
            </h1>
            <p className="text-gray-600">AI-powered audio interviews - questions spoken, not shown</p>
            <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
              <Sparkles className="w-4 h-4" />
              <span>Authentic interview experience with audio-only questions</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Audio Interview Configuration
            </CardTitle>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Volume2 className="w-4 h-4" />
                <span><strong>Audio-Only Experience:</strong> Questions will be spoken aloud, not displayed on screen for authentic interview practice.</span>
              </div>
              {assetContent.length > 50 && (
                <div className="flex items-center gap-2 text-sm text-green-700 mt-2">
                  <Sparkles className="w-4 h-4" />
                  <span><strong>Content-Based Questions:</strong> AI will generate questions specifically based on "{assetTitle}" lesson content.</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto">
              {/* Difficulty */}
              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Questions */}
              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <Select value={numQuestions.toString()} onValueChange={(value) => setNumQuestions(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Questions</SelectItem>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="7">7 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={startInterview} 
              className="w-full" 
              size="lg"
              disabled={isGeneratingQuestions}
            >
              {isGeneratingQuestions ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating AI Questions...
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Start Audio Interview
                </>
              )}
            </Button>
            
            {generationError && (
              <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm text-orange-600">
                  ℹ️ {generationError} The interview will continue with high-quality fallback questions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (interviewState === "generating") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Generating Your Interview</h1>
            <p className="text-gray-600">AI is creating personalized questions for you...</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <Brain className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Creating Interview Questions</h3>
                <p className="text-gray-600 max-w-md">
                  Our AI is generating {numQuestions} {difficulty} level questions based on "{assetTitle}" content.
                </p>
                {assetContent.length > 50 && (
                  <p className="text-sm text-blue-600">
                    ✨ Using actual lesson content for personalized questions
                  </p>
                )}
                {retryCount > 0 && (
                  <p className="text-sm text-orange-600">
                    🔄 Retrying... (Attempt {retryCount + 1}/3)
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Sparkles className="w-4 h-4" />
                <span>This usually takes 10-15 seconds...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (interviewState === "active") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              AI Mock Interview in Progress
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(timer)}
              </span>
              <span>•</span>
              <Badge variant="secondary" className="text-xs">
                AI Generated
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={stopSpeech} disabled={!isPlaying}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" onClick={restartInterview}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleExitInterview} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Audio-Only Question Interface */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              Interviewer Speaking...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {isPlaying ? (
                    <>
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">Speaking question...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">Question ready</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => speakText(questions[currentQuestionIndex])}
                  disabled={isPlaying}
                >
                  {isPlaying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Speaking...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Repeat Question
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopSpeech}
                  disabled={!isPlaying}
                >
                  <Pause className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Volume2 className="w-4 h-4" />
                <span>Listen carefully to the question and provide your answer below.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Answer Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              Your Answer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Type your answer here..."
              value={currentUserAnswer}
              onChange={(e) => setCurrentUserAnswer(e.target.value)}
              rows={6}
              className="mb-4"
            />
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => speakText(answers[currentQuestionIndex], "candidate")}
                disabled={isPlaying}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Hear Sample Answer
              </Button>
              <Button onClick={nextQuestion}>
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <SkipForward className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Complete Interview
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (interviewState === "completed") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-green-600">Interview Completed! 🎉</h1>
            <p className="text-gray-600">Duration: {formatTime(timer)} | Questions: {questions.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={downloadResults}>
              <Download className="w-4 h-4 mr-2" />
              Download Results
            </Button>
            <Button onClick={restartInterview}>
              <RotateCcw className="w-4 h-4 mr-2" />
              New Interview
            </Button>
          </div>
        </div>




        {/* Results */}
        <div className="space-y-6">
          {questions.map((question, index) => {
            
            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-blue-600" />
                    Audio Question {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Bot className="w-4 h-4" />
                      <span>Question was asked via audio only</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => speakText(question)}
                      disabled={isPlaying}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Replay Question
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Your Answer:
                    </h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded">
                      {userAnswers[index] || "No answer provided"}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      AI Sample Answer:
                    </h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded">
                      {answers[index]}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => speakText(answers[index], "candidate")}
                      disabled={isPlaying}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Listen to Sample Answer
                    </Button>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button onClick={() => onBack()} variant="outline" className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={restartInterview}>
            <Mic className="w-4 h-4 mr-2" />
            Start New Interview
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default MockInterviewGenerator;
