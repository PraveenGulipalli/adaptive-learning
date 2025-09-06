import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCourseAssets, generateQuizzes, getQuizzesByCourse } from "../services/api";
import AssetView from "./AssetView";
import QuizPopup from "./QuizPopup";
import { Button } from "./ui/button";
import { GraduationCap, Settings } from "lucide-react";
import CourseTree from "./CourseTree";

/**
 * Home component that serves as the landing page
 */
function Home() {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isLastAssetInModule, setIsLastAssetInModule] = useState(undefined);
  const [selectedModule, setSelectedModule] = useState(undefined);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizGenerationError, setQuizGenerationError] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);

  // Default course ID - you can make this dynamic based on user selection
  const defaultCourseId = "68bc14e817fa5a8d69dc67f5";

  // Handle asset selection
  const handleAssetClick = (asset, isLastAssetInModule, module) => {
    setSelectedAsset(asset);
    setIsLastAssetInModule(isLastAssetInModule);
    setSelectedModule(module);
  };

  // Handle closing asset view
  const handleCloseAsset = () => {
    setSelectedAsset(null);
  };

  // Handle closing quiz popup
  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setQuizData(null);
  };

  const handleNextClick = async () => {
    if (isLastAssetInModule) {
      try {
        setIsGeneratingQuiz(true);
        setQuizGenerationError(null);

        const moduleCode = selectedModule.code;

        const existingQuizzes = await getQuizzesByCourse(defaultCourseId, moduleCode);

        if (existingQuizzes && existingQuizzes.quizzes && existingQuizzes.quizzes.length > 0) {
          const firstQuiz = existingQuizzes.quizzes[0];

          if (firstQuiz && firstQuiz.questions && firstQuiz.questions.length > 0) {
            setQuizData(firstQuiz);
            setShowQuiz(true);
          } else {
            alert("Quiz found but no questions available.");
          }
        } else {
          const quizRequest = {
            course_id: defaultCourseId,
            module_code: moduleCode,
            overwrite: false, // Don't overwrite existing quizzes
            num_questions: 5, // Default number of questions
            difficulty: "medium", // Default difficulty
          };

          const response = await generateQuizzes(quizRequest);

          if (response.success) {
            // Open quiz popup with the generated quiz
            if (response.generated_quizzes && response.generated_quizzes.length > 0) {
              const newQuiz = response.generated_quizzes[0];
              if (newQuiz && newQuiz.questions && newQuiz.questions.length > 0) {
                setQuizData(newQuiz);
                setShowQuiz(true);
              } else {
                alert("Quiz generated but no questions available.");
              }
            } else {
              alert(`Quiz generated successfully! ${response.message}`);
            }
          } else {
            console.error("Quiz generation failed:", response.errors);
            setQuizGenerationError(response.errors?.join(", ") || "Failed to generate quiz");
          }
        }
      } catch (error) {
        console.error("Error handling quiz:", error);
        setQuizGenerationError(error.message || "Failed to handle quiz");
      } finally {
        setIsGeneratingQuiz(false);
      }
    } else {
      const currentAssetIndex = selectedModule.assets.indexOf(selectedAsset);

      handleAssetClick(
        selectedModule.assets[currentAssetIndex + 1],
        currentAssetIndex === selectedModule.assets.length - 2,
        selectedModule
      );
    }
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch course assets
        const assetsData = await getCourseAssets(defaultCourseId);

        // The API response already matches our component structure
        const transformedData = {
          _id: assetsData._id,
          name: assetsData.name || "Generative AI",
          modules: assetsData.modules || [],
        };

        setCourseData(transformedData);
      } catch (err) {
        console.error("Failed to fetch course data:", err);
        setError(err.message || "Failed to load course content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, []);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Adaptive Learning
            </h1>
          </div>

          <Button variant="outline" onClick={() => navigate("/update-preference")} className="gap-2">
            <Settings className="w-4 h-4" />
            Change Preference
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container flex gap-6 py-6 min-h-[calc(100vh-4rem)]">
        {/* Sidebar - Course Tree */}
        <aside className="w-80 flex-shrink-0">
          <CourseTree course={courseData} isLoading={isLoading} error={error} onAssetClick={handleAssetClick} />
        </aside>

        {/* Main Content Area - Asset View */}
        <AssetView
          asset={selectedAsset}
          onClose={handleCloseAsset}
          handleNextClick={handleNextClick}
          isGeneratingQuiz={isGeneratingQuiz}
          quizGenerationError={quizGenerationError}
        />
      </main>

      {/* Quiz Popup */}
      <QuizPopup quiz={quizData} isOpen={showQuiz} onClose={handleCloseQuiz} />
    </>
  );
}

export default Home;
