import React from "react";
import { ListChecks, CheckCircle2 } from "lucide-react";

export default function KeyPointsSection({ content }) {
  if (!content) return null;

  const points = Array.isArray(content) ? content : [content];

  return (
    <div className="learning-sub-content animate-fade-in">
      <div className="key-points-grid">
        {points.map((pt, idx) => {
          const title = typeof pt === "object" ? pt.title : null;
          const text = typeof pt === "object" ? pt.detail || pt.text : pt;

          return (
            <div key={idx} className="key-point-card">
              <div className="point-icon-box">
                <CheckCircle2 size={18} className="text-primary" />
              </div>
              <div className="point-text-wrap">
                {title && <h4 className="point-title">{title}</h4>}
                <p className="point-body">{text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
