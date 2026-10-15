import React from "react";
import {
  Play,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Terminal,
  Layers,
  HelpCircle
} from "lucide-react";

export default function ExampleSection({
  content,
  topic,
  onSelectSection
}) {
  // Graceful fallback if content is missing or null
  if (!content) {
    return (
      <div className="learning-sub-content animate-fade-in">
        <div className="lesson-callout callout-neutral" style={{ padding: "1.75rem 1.5rem" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <div className="example-icon-badge" style={{ flexShrink: 0 }}>
              <HelpCircle size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: 700 }}>
                Example Walkthrough
              </h3>
              <p style={{ margin: "0 0 1rem 0", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                An illustrative worked example for <strong>{topic?.title || "this topic"}</strong> is available in the curriculum. Return to the concept overview to review core principles.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {onSelectSection && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => onSelectSection(1)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <ChevronLeft size={15} />
                    <span>Back to Concept Overview</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isRich = typeof content === "object" && content !== null;
  const title = isRich
    ? content.title || (topic?.title ? `Practical Walkthrough: ${topic.title}` : "Practical Walkthrough")
    : "Worked Scenario";
  const scenario = isRich
    ? content.scenario || content.problem || content.question || ""
    : typeof content === "string"
    ? content
    : "";
  const steps = isRich && Array.isArray(content.steps) ? content.steps : [];
  const diagram = isRich ? content.diagram || content.diagramDescription || content.networkDiagram || null : null;
  const formula = isRich ? content.formula || content.equation || null : null;
  const code = isRich ? content.code || content.codeSnippet || null : null;
  const expectedResult = isRich ? content.expectedResult || content.result || content.conclusion || null : null;
  const practicalApplication = isRich
    ? content.practicalApplication || content.application || content.industryUse || null
    : null;
  const keyInsight = isRich ? content.keyInsight || content.insight || null : null;

  return (
    <div className="learning-sub-content animate-fade-in example-section-container">
      {/* 1. Header Box with Navigation controls */}
      <div className="example-header-box" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div className="example-icon-badge">
            <Play size={20} />
          </div>
          <div>
            <span className="example-subtitle">Practical Walkthrough</span>
            <h3 className="example-title">{title}</h3>
          </div>
        </div>

        {/* Quick section jumps */}
        {onSelectSection && (
          <div className="example-nav-quick-actions" style={{ display: "inline-flex", gap: "8px" }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onSelectSection(1)}
              title="Return to Section 1: Understand"
              style={{ fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              <ChevronLeft size={14} />
              <span>Back to Overview</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Problem / Scenario Box */}
      {scenario && (
        <div className="lesson-callout callout-neutral scenario-callout-box" style={{ borderLeft: "4px solid var(--primary, #3b82f6)", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--primary, #3b82f6)" }}>
              Problem / Scenario
            </span>
          </div>
          <p className="callout-body scenario-text" style={{ margin: 0, lineHeight: 1.6, fontSize: "0.95rem" }}>
            {scenario}
          </p>
        </div>
      )}

      {/* 3. Text/ASCII Diagram / Architecture Flow (if provided) */}
      {diagram && (
        <div className="example-diagram-box" style={{ marginBottom: "1.25rem", borderRadius: "8px", border: "1px solid var(--border-light, #e2e8f0)", overflow: "hidden" }}>
          <div style={{ padding: "0.5rem 1rem", background: "var(--bg-subtle, #f8fafc)", borderBottom: "1px solid var(--border-light, #e2e8f0)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Terminal size={14} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Network / System Flow Diagram
            </span>
          </div>
          <pre style={{ margin: 0, padding: "1rem", background: "var(--bg-surface, #ffffff)", fontFamily: "monospace", fontSize: "0.85rem", lineHeight: 1.45, overflowX: "auto", whiteSpace: "pre" }}>
            <code>{diagram}</code>
          </pre>
        </div>
      )}

      {/* 4. Mathematical Formula / Equation (if provided) */}
      {formula && (
        <div className="lesson-callout callout-neutral" style={{ marginBottom: "1.25rem", background: "var(--bg-subtle, #f8fafc)" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
            Governing Formula
          </span>
          <div style={{ fontFamily: "monospace", fontSize: "1rem", fontWeight: 600, color: "var(--primary, #2563eb)" }}>
            {formula}
          </div>
        </div>
      )}

      {/* 5. Step-by-Step Breakdown */}
      {steps.length > 0 && (
        <div className="example-steps-list-wrapper" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.92rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <Layers size={16} />
            <span>Step-by-Step Walkthrough</span>
          </h4>
          <div className="example-steps-list">
            {steps.map((st, idx) => {
              // Safe extraction of step properties to prevent any React child rendering errors
              const stepLabel =
                typeof st === "object" && st !== null
                  ? st.stage || st.title || st.stepName || st.name || `Step ${idx + 1}`
                  : `Step ${idx + 1}`;

              let stepText = "";
              if (typeof st === "string") {
                stepText = st;
              } else if (typeof st === "object" && st !== null) {
                stepText =
                  st.details ||
                  st.detail ||
                  st.content ||
                  st.description ||
                  st.text ||
                  st.explanation ||
                  "";
              }

              const stepCalc =
                typeof st === "object" && st !== null
                  ? st.calculation || st.code || st.math || null
                  : null;

              return (
                <div key={idx} className="example-step-row" style={{ alignItems: "flex-start" }}>
                  <span className="step-bullet" style={{ marginTop: "2px" }}>{idx + 1}</span>
                  <div className="step-text-wrap" style={{ flex: 1 }}>
                    {stepLabel && <h5 className="step-label">{stepLabel}</h5>}
                    {stepText && <p className="step-body-text">{stepText}</p>}
                    {stepCalc && (
                      <div style={{ marginTop: "0.5rem", padding: "0.5rem 0.75rem", background: "var(--bg-surface, #ffffff)", borderRadius: "6px", border: "1px solid var(--border-light, #e2e8f0)", fontFamily: "monospace", fontSize: "0.85rem", overflowX: "auto" }}>
                        <code>{stepCalc}</code>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Code snippet (if provided) */}
      {code && (
        <div style={{ marginBottom: "1.25rem", borderRadius: "8px", border: "1px solid var(--border-light, #e2e8f0)", overflow: "hidden" }}>
          <div style={{ padding: "0.5rem 1rem", background: "var(--bg-subtle, #f8fafc)", borderBottom: "1px solid var(--border-light, #e2e8f0)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Terminal size={14} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Code Implementation
            </span>
          </div>
          <pre style={{ margin: 0, padding: "1rem", background: "#1e1e2e", color: "#f8f8f2", fontFamily: "monospace", fontSize: "0.85rem", lineHeight: 1.45, overflowX: "auto" }}>
            <code>{code}</code>
          </pre>
        </div>
      )}

      {/* 7. Expected Result / Conclusion */}
      {expectedResult && (
        <div className="lesson-callout callout-success" style={{ marginBottom: "1.25rem", display: "flex", gap: "12px", alignItems: "flex-start", background: "#ecfdf5", borderColor: "#a7f3d0" }}>
          <div className="callout-icon-wrap" style={{ color: "#059669", marginTop: "2px" }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="callout-text-wrap" style={{ flex: 1 }}>
            <h4 className="callout-heading" style={{ color: "#065f46", margin: "0 0 4px 0", fontSize: "0.95rem" }}>
              Expected Result / Conclusion
            </h4>
            <p className="callout-body" style={{ color: "#047857", margin: 0, fontSize: "0.9rem", lineHeight: 1.5 }}>
              {expectedResult}
            </p>
          </div>
        </div>
      )}

      {/* 8. Practical Application (if provided) */}
      {practicalApplication && (
        <div className="lesson-callout callout-neutral" style={{ marginBottom: "1.25rem", display: "flex", gap: "12px", alignItems: "flex-start", background: "#f0fdf4", borderColor: "#bbf7d0" }}>
          <div className="callout-icon-wrap" style={{ color: "#16a34a", marginTop: "2px" }}>
            <Briefcase size={20} />
          </div>
          <div className="callout-text-wrap" style={{ flex: 1 }}>
            <h4 className="callout-heading" style={{ color: "#15803d", margin: "0 0 4px 0", fontSize: "0.95rem" }}>
              Practical Application & Industry Use
            </h4>
            <p className="callout-body" style={{ color: "#166534", margin: 0, fontSize: "0.9rem", lineHeight: 1.5 }}>
              {practicalApplication}
            </p>
          </div>
        </div>
      )}

      {/* 9. Key Insight & Numerical Rule */}
      {keyInsight && (
        <div className="lesson-callout callout-success" style={{ marginBottom: "1.5rem" }}>
          <div className="callout-icon-wrap">
            <Sparkles size={20} />
          </div>
          <div className="callout-text-wrap">
            <h4 className="callout-heading">Key Insight & Takeaway</h4>
            <p className="callout-body">{keyInsight}</p>
          </div>
        </div>
      )}

      {/* 10. Bottom Action Footer */}
      <div className="example-footer-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", paddingTop: "0.75rem", borderTop: "1px solid var(--border-light, #e2e8f0)" }}>
        <div style={{ display: "inline-flex", gap: "8px" }}>
          {onSelectSection && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onSelectSection(1)}
              style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
            >
              <ChevronLeft size={15} />
              <span>Back to Overview</span>
            </button>
          )}
        </div>

        {onSelectSection && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onSelectSection(5)}
            style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
          >
            <span>Proceed to Key Points</span>
            <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
