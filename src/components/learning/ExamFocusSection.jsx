import React from "react";
import { AlertTriangle, Award, CheckCircle2 } from "lucide-react";

export default function ExamFocusSection({ content }) {
  if (!content) return null;

  const isArray = Array.isArray(content);
  const skills = isArray ? content : content.skills || [];
  const commonTraps = !isArray && typeof content === "object" ? content.commonTraps : null;

  return (
    <div className="learning-sub-content animate-fade-in">
      <div className="exam-skills-container">
        <h4 className="sub-section-title">High-Yield University Examination Targets</h4>
        <div className="skills-cards-list">
          {skills.map((skill, idx) => {
            const task = typeof skill === "object" ? skill.task : skill;
            const marks = typeof skill === "object" ? skill.marks : null;
            const prepTip = typeof skill === "object" ? skill.prepTip : null;

            return (
              <div key={idx} className="skill-card">
                <div className="skill-header-row">
                  <span className="skill-task-name">{task}</span>
                  {marks && <span className="marks-badge">{marks}</span>}
                </div>
                {prepTip && <p className="prep-tip-text">💡 {prepTip}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {commonTraps && (
        <div className="lesson-callout callout-danger">
          <div className="callout-icon-wrap">
            <AlertTriangle size={20} />
          </div>
          <div className="callout-text-wrap">
            <h4 className="callout-heading">Common Exam Pitfall to Avoid</h4>
            <p className="callout-body">{commonTraps}</p>
          </div>
        </div>
      )}
    </div>
  );
}
