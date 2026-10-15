import React from "react";
import { Lightbulb, Info, CheckCircle2 } from "lucide-react";

export default function UnderstandingSection({ content, topicTitle }) {
  if (!content) return null;

  // Support both rich object format and concise string format
  const isRich = typeof content === "object" && content !== null;
  const headline = isRich ? content.headline : null;
  const problemSolved = isRich ? (content.problemSolved || content.overview) : content;
  const routerDecision = isRich ? content.routerDecision : null;
  const terminology = isRich ? content.terminology : null;
  const summaryTakeaway = isRich ? content.summaryTakeaway : null;

  return (
    <div className="learning-sub-content animate-fade-in">
      {headline && (
        <div className="section-headline-box">
          <span className="headline-tag">Core Concept</span>
          <h2 className="section-main-heading">{headline}</h2>
        </div>
      )}

      {problemSolved && (
        <div className="lesson-callout callout-info">
          <div className="callout-icon-wrap">
            <Info size={20} />
          </div>
          <div className="callout-text-wrap">
            <h4 className="callout-heading">What Problem Does This Solve?</h4>
            <p className="callout-body">{problemSolved}</p>
          </div>
        </div>
      )}

      {routerDecision && (
        <div className="lesson-callout callout-primary">
          <div className="callout-icon-wrap">
            <Lightbulb size={20} />
          </div>
          <div className="callout-text-wrap">
            <h4 className="callout-heading">The Core Solution & Architecture</h4>
            <p className="callout-body">{routerDecision}</p>
          </div>
        </div>
      )}

      {Array.isArray(terminology) && terminology.length > 0 && (
        <div className="terminology-section">
          <h4 className="sub-section-title">Essential Terminology & Definitions</h4>
          <div className="terminology-cards-grid">
            {terminology.map((item, idx) => (
              <div key={idx} className="term-card">
                <span className="term-name">{item.term}</span>
                <p className="term-def">{item.def}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {summaryTakeaway && (
        <div className="lesson-callout callout-success">
          <div className="callout-icon-wrap">
            <CheckCircle2 size={20} />
          </div>
          <div className="callout-text-wrap">
            <h4 className="callout-heading">Key Intuition</h4>
            <p className="callout-body">{summaryTakeaway}</p>
          </div>
        </div>
      )}
    </div>
  );
}
