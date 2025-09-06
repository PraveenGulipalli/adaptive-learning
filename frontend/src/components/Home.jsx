import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCourseAssets, generateQuizzes } from "../services/api";
import AssetView from "./AssetView";

/**
 * CourseTree component to display hierarchical course structure
 */
function CourseTree({ course, isLoading, error, onAssetClick }) {
  const [expandedModules, setExpandedModules] = useState(new Set());

  const toggleModule = (moduleIndex) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleIndex)) {
      newExpanded.delete(moduleIndex);
    } else {
      newExpanded.add(moduleIndex);
    }
    setExpandedModules(newExpanded);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 text-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin text-2xl mb-2">⏳</div>
            <p className="text-muted">Loading course content...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 text-sm">
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: "var(--error-50)",
            color: "var(--error-700)",
            border: "1px solid var(--error-200)",
          }}
        >
          <div className="flex items-center mb-2">
            <span className="mr-2">⚠️</span>
            <span className="font-semibold">Error Loading Course</span>
          </div>
          <p className="text-sm">{error}</p>
          <button className="btn-outline mt-3 text-sm py-1" onClick={() => window.location.reload()}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // No course data
  if (!course) {
    return (
      <div className="p-4 text-sm">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📚</div>
          <p className="text-muted">No course data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 text-sm">
      {/* Course Name */}
      <div className="flex items-center mb-4 pb-3 border-b border-theme">
        <span className="text-xl font-bold flex items-center gradient-primary text-white px-3 py-2 rounded-lg shadow-sm">
          📚 {course.name}
        </span>
      </div>

      {/* Modules */}
      <div className="space-y-2">
        {course.modules.map((module, moduleIndex) => (
          <div key={module._id || moduleIndex} className="border border-theme rounded-lg overflow-hidden card-hover">
            {/* Module Header */}
            <div
              className="flex items-center cursor-pointer module-item p-3 bg-surface"
              onClick={() => toggleModule(moduleIndex)}
            >
              <span className="mr-3 text-muted transition-transform duration-200 text-lg">
                {expandedModules.has(moduleIndex) ? "▼" : "▶"}
              </span>
              <div className="flex items-center gap-2">
                📖
                <span className="text-primary font-semibold text-base flex items-center text-balance">
                  {module.name || `Module ${moduleIndex + 1}`}
                </span>
              </div>
            </div>

            {/* Module Assets */}
            {expandedModules.has(moduleIndex) && (
              <div className="bg-surface-secondary border-t border-theme">
                {module.assets && module.assets.length > 0 && (
                  <div className="p-3 space-y-1">
                    {module.assets.map((asset, assetIndex) => (
                      <div
                        key={asset._id || asset.$oid || assetIndex}
                        className="asset-item flex items-center cursor-pointer p-2 rounded-lg group"
                        onClick={() =>
                          onAssetClick && onAssetClick(asset, assetIndex === module.assets.length - 1, module)
                        }
                      >
                        <div className="mr-3 p-1 rounded bg-secondary-50 group-hover:bg-secondary-100 transition-colors">
                          <span className="text-secondary text-sm">📄</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-secondary group-hover:text-secondary transition-colors">
                            {asset.name || `Lesson ${assetIndex + 1}`}
                          </span>
                          {/* <div className="flex flex-wrap gap-1 mt-1">
                            {asset.domain && (
                              <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                                🎯 {asset.domain}
                              </span>
                            )}
                            {asset.hobby && (
                              <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded">
                                ❤️ {asset.hobby}
                              </span>
                            )}
                            {asset.language && (
                              <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                                🌍 {asset.language.toUpperCase()}
                              </span>
                            )}
                          </div> */}
                          <div className="text-xs text-muted font-mono mt-1">
                            ID: {(asset._id || asset.$oid)?.substring(0, 12) || "N/A"}...
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-accent bg-accent-50 px-2 py-1 rounded">→</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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

  const handleNextClick = async () => {
    if (isLastAssetInModule) {
      console.log("Last asset in module - generating quiz");

      try {
        setIsGeneratingQuiz(true);
        setQuizGenerationError(null);

        // Generate quiz for the current module
        const moduleCode = selectedModule.code || selectedModule._id || `module_${selectedModule.name}`;
        const quizRequest = {
          course_id: defaultCourseId,
          module_code: moduleCode,
          overwrite: false, // Don't overwrite existing quizzes
          num_questions: 5, // Default number of questions
          difficulty: "medium", // Default difficulty
        };

        const response = await generateQuizzes(quizRequest);

        if (response.success) {
          console.log("Quiz generated successfully:", response.message);
          console.log("Generated quizzes:", response.generated_quizzes);

          // You can show a success message or navigate to the quiz
          // For now, we'll just log the success
          alert(`Quiz generated successfully! ${response.message}`);
        } else {
          console.error("Quiz generation failed:", response.errors);
          setQuizGenerationError(response.errors?.join(", ") || "Failed to generate quiz");
        }
      } catch (error) {
        console.error("Error generating quiz:", error);
        setQuizGenerationError(error.message || "Failed to generate quiz");
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
      <header
        className="fixed top-0 w-full shadow-lg z-50"
        style={{ backgroundColor: "var(--header-bg)", boxShadow: "0 4px 6px var(--header-shadow)" }}
      >
        <div className="flex justify-center items-center h-20 text-2xl font-bold app-container relative">
          <span className="gradient-primary text-white px-4 py-2 rounded-lg">🎓 Adaptive Learning</span>
          <button
            className="absolute right-5 h-10 flex items-center outline outline-1 px-4 rounded-md text-base"
            onClick={() => {
              navigate("/update-preference");
            }}
          >
            ⚙️ Change Preference
          </button>
        </div>
      </header>
      <main className="pt-20 flex w-full min-h-screen app-container" style={{ backgroundColor: "var(--background)" }}>
        <aside
          className="w-80 shadow-lg overflow-y-auto"
          style={{ backgroundColor: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
        >
          <CourseTree course={courseData} isLoading={isLoading} error={error} onAssetClick={handleAssetClick} />
        </aside>
        <AssetView
          asset={selectedAsset}
          onClose={handleCloseAsset}
          handleNextClick={handleNextClick}
          isGeneratingQuiz={isGeneratingQuiz}
          quizGenerationError={quizGenerationError}
        />
      </main>
    </>
  );
}

export default Home;
