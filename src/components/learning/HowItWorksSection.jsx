import React from "react";
import { Layers, CheckCircle2, ArrowRight } from "lucide-react";

export default function HowItWorksSection({ content }) {
  if (!content) return null;

  // Determine if content is array of steps or rich object
  const isArray = Array.isArray(content);
  const overview = !isArray && typeof content === "object" ? content.overview : null;
  const steps = isArray
    ? content
    : content.steps || [];
  const comparison = !isArray && typeof content === "object" ? content.comparison : null;

  return (
    <div className="learning-sub-content animate-fade-in">
      {overview && (
        <div className="how-it-works-intro">
          <p className="lead-text">{overview}</p>
        </div>
      )}

      {/* Steps List */}
      <div className="steps-flow-container">
        {steps.map((st, idx) => {
          const stepNum = typeof st === "object" ? st.step || idx + 1 : idx + 1;
          const stepTitle = typeof st === "object" ? st.title : `Phase ${idx + 1}`;
          const stepContent = typeof st === "object" ? st.content : st;

          return (
            <div key={idx} className="step-card">
              <div className="step-badge-col">
                <span className="step-number-badge">{stepNum}</span>
              </div>
              <div className="step-body-col">
                <h4 className="step-title">{stepTitle}</h4>
                <p className="step-desc">{stepContent}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional Comparison Table */}
      {comparison && comparison.headers && comparison.rows && (
        <div className="comparison-table-wrapper">
          <h4 className="sub-section-title">Key Architectural Comparison</h4>
          <div className="table-responsive">
            <table className="comparison-table">
              <thead>
                <tr>
                  {comparison.headers.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
