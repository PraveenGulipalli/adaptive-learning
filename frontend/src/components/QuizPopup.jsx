import React, { useState, useEffect } from "react";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📝 Quiz</h2>
            <p className="text-sm text-gray-600 mt-1">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Score: {score}/{currentQuestionIndex + (showResult ? 1 : 0)}
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close Quiz"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + (showResult ? 1 : 0)) / quiz.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          {/* Question */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">{currentQuestion.question}</h3>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => {
              let buttonClass = "w-full p-4 text-left border rounded-lg transition-all duration-200 ";

              if (showResult) {
                if (index === currentQuestion.correct_answer) {
                  // Correct answer - always green
                  buttonClass += "bg-green-100 border-green-500 text-green-800";
                } else if (index === selectedAnswer && selectedAnswer !== currentQuestion.correct_answer) {
                  // Wrong selected answer - red
                  buttonClass += "bg-red-100 border-red-500 text-red-800";
                } else {
                  // Other options - neutral
                  buttonClass += "bg-gray-50 border-gray-300 text-gray-600";
                }
              } else {
                // Before submission
                if (selectedAnswer === index) {
                  buttonClass += "bg-blue-100 border-blue-500 text-blue-800 font-medium";
                } else {
                  buttonClass += "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={buttonClass}
                  disabled={showResult}
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-3 text-sm font-semibold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-3">
            {/* Result Message */}
            {showResult && (
              <div
                className={`p-4 rounded-lg mr-auto ${
                  isCorrect
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{isCorrect ? "✅" : "❌"}</span>
                  <div>
                    <p className="font-semibold">{isCorrect ? "Correct!" : "Incorrect"}</p>
                    {!isCorrect && (
                      <p className="text-sm mt-1">
                        The correct answer is:{" "}
                        <strong>{currentQuestion.options[currentQuestion.correct_answer]}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {!showResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedAnswer !== null
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg h-fit"
              >
                {isLastQuestion ? "Complete Quiz" : "Next Question →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizPopup;
