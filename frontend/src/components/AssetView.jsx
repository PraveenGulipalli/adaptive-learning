import React, { useState, useEffect } from "react";
import { getPersonalizedAsset, translateAsset } from "../services/api";
import MarkdownPreview from "@uiw/react-markdown-preview";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  FileText,
  X,
  Sparkles,
  RefreshCw,
  ArrowRight,
  BookOpen,
  Target,
  BarChart3,
  CheckCircle,
  Loader2,
  AlertCircle,
  Languages,
} from "lucide-react";

const preprocessMarkdown = (markdown) => {
  if (!markdown) return "";
  // Replace \( ... \) with $$ ... $$ for inline math
  let processed = markdown.replace(/\\\((.*?)\\\)/gs, "$ $1 $");

  // Replace \[ ... \] with $$ ... $$ for block math
  processed = processed.replace(/\\\[(.*?)\\\]/gs, "$$\n$1\n$$");

  return processed;
};

/**
 * AssetView component to display asset content in HTML format
 */
function AssetView({ asset, onClose, handleNextClick, isGeneratingQuiz = false, quizGenerationError = null }) {
  const [isGeneratingPersonalized, setIsGeneratingPersonalized] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [translatedContent, setTranslatedContent] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  useEffect(() => {
    setPersonalizedContent(null);
    setTranslatedContent(null);
    setSelectedLanguage("en");
    setTranslationError(null);
  }, [asset]);

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

  /**
   * Handles language change and translation
   */
  const handleLanguageChange = async (language) => {
    if (!asset?.code || language === "en") {
      setSelectedLanguage(language);
      setTranslatedContent(null);
      setTranslationError(null);
      return;
    }

    try {
      setIsTranslating(true);
      setTranslationError(null);
      setSelectedLanguage(language);

      const translatedAsset = await translateAsset(asset.code, language);
      setTranslatedContent(translatedAsset);
    } catch (error) {
      console.error("Error translating content:", error);
      setTranslationError(error.message || "Translation failed");
      // Reset to English on error
      setSelectedLanguage("en");
    } finally {
      setIsTranslating(false);
    }
  };

  if (!asset) {
    return (
      <div className="flex-1">
        <Card className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-4">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome to Your Learning Journey
            </CardTitle>
            <p className="text-muted-foreground text-lg max-w-md">
              Select a lesson from the course outline to begin learning
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              <p className="text-sm font-medium">Track Progress</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Personalized Content</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-sm font-medium">Analytics & Insights</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Card className="flex-1 flex flex-col shadow-lg">
        {/* Asset Header */}
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex gap-4 items-center">
                <CardTitle className="text-xl font-bold text-primary">{asset.name}</CardTitle>
                <div className="flex items-center gap-3 text-sm">
                  {/* Language Selector */}
                  {!personalizedContent?.asset?.content && (
                    <div className="flex items-center gap-2">
                      <Languages className="w-4 h-4 text-muted-foreground" />
                      <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isTranslating}>
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                          <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                        </SelectContent>
                      </Select>
                      {isTranslating && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                {personalizedContent ? (
                  <Button variant="outline" size="sm" onClick={() => setPersonalizedContent(null)} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Show Original
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGeneratePersonalizedContent}
                    disabled={isGeneratingPersonalized}
                    className="gap-2 min-w-[256px]"
                  >
                    {isGeneratingPersonalized ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Personalized Content
                      </>
                    )}
                  </Button>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Asset Content */}
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="p-6 space-y-4">
            {/* Translation Error */}
            {translationError && (
              <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-destructive">Translation Error</p>
                  <p className="text-xs text-muted-foreground">{translationError}</p>
                </div>
              </div>
            )}

            {/* Translated Content */}
            {personalizedContent?.asset?.content && ["generated", "exact"].includes(personalizedContent?.match_type) ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-primary">Personalized Content</p>
                    <p className="text-xs text-muted-foreground">Generated based on your preferences</p>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <MarkdownPreview
                    source={preprocessMarkdown(personalizedContent.asset.content)}
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    wrapperElement={{
                      "data-color-mode": "light",
                    }}
                    className="text-sm leading-relaxed"
                  />
                </div>
              </div>
            ) : (
              (asset.content || translatedContent) && (
                <div
                  className="prose prose-sm max-w-none text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: translatedContent?.asset?.content ?? asset.content }}
                />
              )
            )}
          </div>
        </CardContent>

        <Separator />

        {/* Action Bar */}
        <CardContent className="p-4">
          <div className="flex justify-center items-center gap-4">
            <div className="flex flex-col items-end gap-2">
              {quizGenerationError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-semibold">Quiz Error:</span>
                  <span>{quizGenerationError}</span>
                </div>
              )}

              <Button onClick={handleNextClick} disabled={isGeneratingQuiz} className="gap-2 min-w-[180px]">
                {isGeneratingQuiz ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AssetView;
