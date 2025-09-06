import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * CourseTree component to display hierarchical course structure
 */
function CourseTree({ course }) {
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
          <div key={moduleIndex} className="border border-theme rounded-lg overflow-hidden card-hover">
            {/* Module Header */}
            <div
              className="flex items-center cursor-pointer module-item p-3 bg-surface"
              onClick={() => toggleModule(moduleIndex)}
            >
              <span className="mr-3 text-muted transition-transform duration-200 text-lg">
                {expandedModules.has(moduleIndex) ? "▼" : "▶"}
              </span>
              <span className="text-primary font-semibold text-base flex items-center">
                📖 Module {moduleIndex + 1}
              </span>
              <div className="ml-auto">
                <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full">
                  {module.assets?.length || 0} assets
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
                        key={assetIndex}
                        className="asset-item flex items-center cursor-pointer p-2 rounded-lg group"
                      >
                        <div className="mr-3 p-1 rounded bg-secondary-50 group-hover:bg-secondary-100 transition-colors">
                          <span className="text-secondary text-sm">📄</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-secondary group-hover:text-secondary transition-colors">
                            Lesson {assetIndex + 1}
                          </span>
                          <div className="text-xs text-muted font-mono">ID: {asset.$oid.substring(0, 12)}...</div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-accent bg-accent-50 px-2 py-1 rounded">Open →</span>
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

  // Sample course data following the provided structure
  const courseData = {
    name: "Generative AI",
    modules: [
      {
        type: "module",
        assets: [
          { $oid: "68bc14d817fa5a8d69dc67f4" },
          { $oid: "68bc14d817fa5a8d69dc67f5" },
          { $oid: "68bc14d817fa5a8d69dc67f6" },
        ],
      },
      {
        type: "module",
        assets: [{ $oid: "68bc14d817fa5a8d69dc67f7" }, { $oid: "68bc14d817fa5a8d69dc67f8" }],
      },
      {
        type: "module",
        assets: [{ $oid: "68bc14d817fa5a8d69dc67f9" }],
      },
    ],
  };

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
          <CourseTree course={courseData} />
        </aside>
        <section className="flex-1 p-8">
          <div className="card p-8 text-center">
            <div className="mb-4">
              <span className="text-6xl">📖</span>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Welcome to Your Learning Journey</h2>
            <p className="text-muted text-lg mb-6">Select a lesson from the course outline to begin learning</p>
            <div className="flex justify-center space-x-4">
              <div className="text-center">
                <div className="bg-accent-100 text-accent p-3 rounded-full inline-block mb-2">✅</div>
                <p className="text-sm text-muted">Track Progress</p>
              </div>
              <div className="text-center">
                <div className="bg-primary-100 text-primary p-3 rounded-full inline-block mb-2">🎯</div>
                <p className="text-sm text-muted">Personalized Content</p>
              </div>
              <div className="text-center">
                <div className="bg-secondary-100 text-secondary p-3 rounded-full inline-block mb-2">📊</div>
                <p className="text-sm text-muted">Analytics & Insights</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Home;
