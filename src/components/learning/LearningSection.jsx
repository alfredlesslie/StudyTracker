import React from "react";
import { CheckCircle2 } from "lucide-react";
import UnderstandingSection from "./UnderstandingSection";
import WhyItMattersSection from "./WhyItMattersSection";
import HowItWorksSection from "./HowItWorksSection";
import ExampleSection from "./ExampleSection";
import KeyPointsSection from "./KeyPointsSection";
import ExamFocusSection from "./ExamFocusSection";
import SelfCheckSection from "./SelfCheckSection";

export default function LearningSection({
  activeSection,
  content,
  topic,
  isSectionLearned = false,
  onToggleLearned,
  onCompleteSection,
  onConfidenceSelect,
  confidenceLevel,
  confidenceSavedMessage,
  onStartPractice,
  onSelectSection
}) {
  if (!activeSection) return null;

  const Icon = activeSection.icon;

  const renderSectionContent = () => {
    switch (activeSection.key) {
      case "understand":
        return (
          <UnderstandingSection
            content={content?.understand}
            topicTitle={topic?.title}
          />
        );
      case "whyItMatters":
        return <WhyItMattersSection content={content?.whyItMatters} />;
      case "howItWorks":
        return <HowItWorksSection content={content?.howItWorks} />;
      case "example":
        return (
          <ExampleSection
            content={content?.example}
            topic={topic}
            onSelectSection={onSelectSection}
          />
        );
      case "keyPoints":
        return <KeyPointsSection content={content?.keyPoints} />;
      case "examFocus":
        return <ExamFocusSection content={content?.examFocus} />;
      case "selfCheck":
        return (
          <SelfCheckSection
            selfCheck={content?.selfCheck}
            topic={topic}
            onConfidenceSelect={onConfidenceSelect}
            confidenceLevel={confidenceLevel}
            confidenceSavedMessage={confidenceSavedMessage}
            onStartPractice={onStartPractice}
            onCompleteSection={onCompleteSection}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section className="card active-learning-card animate-fade-in">
      <div
        className="section-card-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px"
        }}
      >
        <div className="section-badge-cluster">
          <div className="section-icon-circle">
            <Icon size={20} />
          </div>
          <div>
            <span className="section-super-label">Section {activeSection.id} of 7</span>
            <h2 className="section-display-title">{activeSection.label}</h2>
          </div>
        </div>

        <button
          className={`btn btn-sm ${isSectionLearned ? "btn-success" : "btn-outline"}`}
          onClick={() => onToggleLearned && onToggleLearned(activeSection.id)}
          title={isSectionLearned ? "Concept learned! Click to unmark" : "Click to mark this concept as learned"}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <CheckCircle2 size={16} />
          <span>{isSectionLearned ? "Concept Learned ✓" : "Mark Concept Learned"}</span>
        </button>
      </div>

      <div className="section-card-content">{renderSectionContent()}</div>
    </section>
  );
}
