import React, { useRef, useEffect } from "react";

/**
 * AssetView component to display asset content in HTML format
 * @param {Object} props - Component props
 * @param {Object} props.asset - The selected asset object containing content field with HTML string
 * @param {Function} props.onClose - Function to close the asset view
 */
/**
 * IsolatedContent component that renders HTML content with isolated styles using Shadow DOM
 */
function IsolatedContent({ htmlContent }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && htmlContent) {
      // Clear existing content
      containerRef.current.innerHTML = "";

      try {
        // Create shadow root for style isolation
        const shadowRoot = containerRef.current.attachShadow({ mode: "open" });

        // Create a wrapper div inside shadow root
        const wrapper = document.createElement("div");
        wrapper.style.cssText = `
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
          color: #374151;
          padding: 2rem;
          max-width: none;
          font-size: 16px;
        `;

        // Set the HTML content
        wrapper.innerHTML = htmlContent;

        // Append to shadow root
        shadowRoot.appendChild(wrapper);
      } catch (error) {
        // Fallback: if shadow DOM is not supported, use regular innerHTML
        console.warn("Shadow DOM not supported, falling back to regular innerHTML:", error);
        containerRef.current.innerHTML = htmlContent;
      }
    }
  }, [htmlContent]);

  return <div ref={containerRef} className="isolated-content" />;
}

function AssetView({ asset, onClose }) {
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

      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-sm border border-gray-200">
        {asset.content && <IsolatedContent htmlContent={asset.content} />}
      </div>

      {/* Action Bar */}
      <div className="bg-surface border-t border-theme p-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button className="btn-outline text-sm">📚 Notes</button>
            <button className="btn-outline text-sm">🔗 Share</button>
          </div>
          <div className="flex space-x-2">
            <button className="btn-outline text-sm">← Previous</button>
            <button className="btn-primary text-sm">Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssetView;
