import React, { useRef, useEffect, useState } from "react";
import { getPersonalizedAsset } from "../services/api";

/**
 * @typedef {Object} Asset
 * @property {string} _id - Unique identifier for the asset
 * @property {string} [$oid] - Alternative unique identifier (MongoDB ObjectId format)
 * @property {string} name - Display name of the asset
 * @property {string} style - Style variant of the asset (e.g., "original")
 * @property {string} content - HTML string content to be displayed
 * @property {string} code - Asset code identifier
 * @property {string} language - Language code (e.g., "en")
 * @property {string} domain - Subject domain (e.g., "General")
 * @property {string} hobby - Associated hobby or interest (e.g., "Learning")
 */

/**
 * AssetView component to display asset content in HTML format
 * @param {Object} props - Component props
 * @param {Asset|null} props.asset - The selected asset object containing content field with HTML string
 * @param {Function} props.onClose - Function to close the asset view
 */

/**
 * Removes style tags and their content from HTML string
 * @param {string} html - The HTML string to process
 * @returns {string} - HTML string with style tags removed
 */
function removeStyleTags(html) {
  if (!html || typeof html !== "string") return html;
  return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
}

function AssetView({ asset, onClose }) {
  const [isGeneratingPersonalized, setIsGeneratingPersonalized] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState(null);

  /**
   * Handles the generation of personalized content
   */
  const handleGeneratePersonalizedContent = async () => {
    if (!asset?.code) {
      console.error("Asset code is required for personalization");
      return;
    }

    try {
      setIsGeneratingPersonalized(true);

      // Get user preferences from localStorage
      const userProfile = localStorage.getItem("userProfile");
      const profile = userProfile ? JSON.parse(userProfile) : {};

      const domain = profile.domain;
      const hobby = profile.hobbies;
      const style = profile.learningStyle;

      console.log("Generating personalized content with:", {
        code: asset.code,
        domain,
        hobby,
        style,
      });

      const personalizedAsset = await getPersonalizedAsset(asset.code, domain, hobby, style);
      setPersonalizedContent(personalizedAsset);

      console.log("Personalized content generated successfully");
    } catch (error) {
      console.error("Error generating personalized content:", error);
      // You might want to show a toast notification here
    } finally {
      setIsGeneratingPersonalized(false);
    }
  };

  if (!asset) {
    return (
      <div className="flex-1 p-8">
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
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 flex flex-col">
      {/* Asset Header */}
      <div className="bg-surface border-b border-theme p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 text-primary p-2 rounded-lg">📄</div>
            <div>
              <h1 className="text-xl font-bold text-primary">{asset.name}</h1>
              <div className="flex items-center space-x-2 text-sm text-muted mb-1">
                <span>ID: {(asset._id || asset.$oid)?.substring(0, 8) || "N/A"}</span>
                {asset.code && <span>Code: {asset.code.substring(0, 8)}</span>}
                {asset.language && (
                  <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                    🌍 {asset.language.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted">
                {asset.domain && (
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">🎯 {asset.domain}</span>
                )}
                {asset.hobby && (
                  <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded">❤️ {asset.hobby}</span>
                )}
                {asset.style && <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded">✨ {asset.style}</span>}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-secondary rounded-lg transition-colors text-muted hover:text-primary"
            title="Close asset view"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Asset Content */}

      <div className="flex-1 overflow-y-auto bg-white shadow-sm border border-gray-200 p-4">
        {personalizedContent && personalizedContent.content ? (
          <div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-400">✨</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Personalized Content:</strong> Generated based on your preferences
                  </p>
                </div>
              </div>
            </div>
            <div dangerouslySetInnerHTML={{ __html: removeStyleTags(personalizedContent.content) }}></div>
          </div>
        ) : (
          asset.content && <div dangerouslySetInnerHTML={{ __html: asset.content }}></div>
        )}
      </div>

      {/* Action Bar */}
      <div className="bg-surface border-t border-theme p-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              className={`btn-outline text-sm ${isGeneratingPersonalized ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleGeneratePersonalizedContent}
              disabled={isGeneratingPersonalized}
            >
              {isGeneratingPersonalized ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  Generating...
                </>
              ) : (
                "Generate Personalised Content"
              )}
            </button>
            {personalizedContent && (
              <button className="btn-outline text-sm" onClick={() => setPersonalizedContent(null)}>
                Show Original
              </button>
            )}
          </div>
          <div className="flex space-x-2">
            <button className="btn-primary text-sm">Mark as Complete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssetView;
