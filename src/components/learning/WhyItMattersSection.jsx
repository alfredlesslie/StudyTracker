import React from "react";
import { HelpCircle, Compass, GraduationCap } from "lucide-react";

export default function WhyItMattersSection({ content }) {
  if (!content) return null;

  const isRich = typeof content === "object" && content !== null;
  const analogy = isRich ? content.analogy : content;
  const academicConnection = isRich ? content.academicConnection : null;

  return (
    <div className="learning-sub-content animate-fade-in">
      {analogy && (
        <div className="lesson-callout callout-warning">
          <div className="callout-icon-wrap">
            <Compass size={20} />
          </div>
          <div className="callout-text-wrap">
            <h4 className="callout-heading">Real-World Intuition & Analogy</h4>
            <p className="callout-body">{analogy}</p>
          </div>
        </div>
      )}

      {academicConnection && (
        <div className="lesson-callout callout-info">
          <div className="callout-icon-wrap">
            <GraduationCap size={20} />
          </div>
          <div className="callout-text-wrap">
            <h4 className="callout-heading">University & Industry Relevance</h4>
            <p className="callout-body">{academicConnection}</p>
          </div>
        </div>
      )}
    </div>
  );
}
