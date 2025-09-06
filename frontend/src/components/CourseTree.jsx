import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useState } from "react";

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
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full p-8">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <div className="space-y-2">
              <p className="font-medium">Loading course content...</p>
              <p className="text-sm text-muted-foreground">Please wait while we fetch your learning materials</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-destructive">Error Loading Course</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No course data
  if (!course) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="font-medium">No course data available</p>
              <p className="text-sm text-muted-foreground">Please check back later</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <CardTitle className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {course.name}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 overflow-y-auto">
        {course.modules.map((module, moduleIndex) => (
          <Card key={module._id || moduleIndex} className="learning-card-hover border">
            {/* Module Header */}
            <CardHeader
              className="p-3 cursor-pointer hover:bg-popover/50 transition-colors overflow-hidden"
              onClick={() => toggleModule(moduleIndex)}
            >
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground">
                  {expandedModules.has(moduleIndex) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
                <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-base text-balance font-semibold">
                  {module.name || `Module ${moduleIndex + 1}`}
                </CardTitle>
              </div>
            </CardHeader>

            {/* Module Assets */}
            {expandedModules.has(moduleIndex) && (
              <CardContent className="p-0 border-t bg-background/10">
                {module.assets && module.assets.length > 0 ? (
                  <div className="space-y-1 p-2">
                    {module.assets.map((asset, assetIndex) => (
                      <Button
                        key={asset._id || asset.$oid || assetIndex}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 hover:bg-card/60 group"
                        onClick={() =>
                          onAssetClick && onAssetClick(asset, assetIndex === module.assets.length - 1, module)
                        }
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-8 h-8 bg-secondary/10 rounded-md flex flex-shrink-0 items-center justify-center group-hover:bg-secondary/20 transition-colors">
                            <FileText className="w-4 h-4 text-secondary" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm group-hover:text-secondary transition-colors truncate text-ellipsis max-w-[180px] m-0">
                              {asset.name || `Lesson ${assetIndex + 1}`}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <p className="text-sm">No assets available in this module</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

export default CourseTree;
