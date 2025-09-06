import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { CheckCircle, XCircle, Trophy, ArrowRight, FileText } from "lucide-react";
import { cn } from "../libs/utils";

/**
 * QuizPopup component for displaying quiz questions one at a time
 */
function QuizPopup({ quiz, isOpen, onClose }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  // Reset quiz state when quiz changes or popup opens
  useEffect(() => {
    if (isOpen && quiz) {
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
      setScore(0);
      setAnsweredQuestions([]);
    }
  }, [isOpen, quiz]);

  // Don't render if not open or no quiz data
  if (!isOpen || !quiz || !quiz.questions || quiz.questions.length === 0) {
    return null;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progress = ((currentQuestionIndex + (showResult ? 1 : 0)) / quiz.questions.length) * 100;

  const handleAnswerSelect = (answerIndex) => {
    if (!showResult) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const correct = selectedAnswer === currentQuestion.correct_answer;
    setIsCorrect(correct);
    setShowResult(true);

    // Update score and answered questions tracking
    const newAnsweredQuestion = {
      questionIndex: currentQuestionIndex,
      selectedAnswer,
      correct,
      question: currentQuestion.question,
    };

    setAnsweredQuestions([...answeredQuestions, newAnsweredQuestion]);

    if (correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Quiz completed - show final results or close
      handleQuizComplete();
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  const handleQuizComplete = () => {
    const finalScore = score + (isCorrect ? 1 : 0);
    const percentage = Math.round((finalScore / quiz.questions.length) * 100);

    alert(`Quiz Complete! Your score: ${finalScore}/${quiz.questions.length} (${percentage}%)`);

    // Close the quiz popup
    onClose();
  };

  const handleClose = () => {
    if (window.confirm("Are you sure you want to close the quiz? Your progress will be lost.")) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">Quiz</DialogTitle>
                <DialogDescription>
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="tertiary" className="text-sm">
                Score: {score}/{currentQuestionIndex + (showResult ? 1 : 0)}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}% Complete</p>
          </div>
        </DialogHeader>

        <Separator />

        {/* Question Content */}
        <div className="space-y-6">
          {/* Question */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold leading-relaxed text-foreground">{currentQuestion.question}</h3>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              let buttonVariant = "outline";
              let buttonClassName = "w-full p-4 text-left justify-start h-auto transition-all duration-200";
              let iconElement = null;

              if (showResult) {
                if (index === currentQuestion.correct_answer) {
                  // Correct answer - always green
                  buttonClassName = cn(buttonClassName, "quiz-option-correct border-green-500");
                  iconElement = <CheckCircle className="w-5 h-5 text-green-600" />;
                } else if (index === selectedAnswer && selectedAnswer !== currentQuestion.correct_answer) {
                  // Wrong selected answer - red
                  buttonClassName = cn(buttonClassName, "quiz-option-incorrect border-red-500");
                  iconElement = <XCircle className="w-5 h-5 text-red-600" />;
                } else {
                  // Other options - neutral
                  buttonClassName = cn(buttonClassName, "quiz-option-neutral");
                }
              } else {
                // Before submission
                if (selectedAnswer === index) {
                  buttonClassName = cn(buttonClassName, "quiz-option-selected border-primary bg-primary/10");
                  iconElement = <CheckCircle className="w-5 h-5 text-primary" />;
                } else {
                  buttonClassName = cn(buttonClassName, "hover:bg-accent hover:text-accent-foreground");
                }
              }

              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  onClick={() => handleAnswerSelect(index)}
                  className={buttonClassName}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 text-left">{option}</span>
                    {iconElement && <div className="flex-shrink-0">{iconElement}</div>}
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Result Message & Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            {/* Result Message */}
            {showResult && (
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg border mr-auto",
                  isCorrect
                    ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-100"
                    : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-100"
                )}
              >
                <div className="flex-shrink-0">
                  {isCorrect ? (
                    <Trophy className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{isCorrect ? "Excellent!" : "Not quite right"}</p>
                  {!isCorrect && (
                    <p className="text-sm mt-1">
                      The correct answer is: <strong>{currentQuestion.options[currentQuestion.correct_answer]}</strong>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex-shrink-0">
              {!showResult ? (
                <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null} className="min-w-[140px]">
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNext} className="min-w-[140px]">
                  {isLastQuestion ? (
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Complete Quiz
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Next Question
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default QuizPopup;
