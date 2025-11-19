import { IoCloseOutline, IoSchoolOutline } from "react-icons/io5";

interface LearningModeProps {
  onClose: () => void;
}

export function LearningMode({ onClose }: LearningModeProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <IoSchoolOutline
              style={{ marginRight: "10px", verticalAlign: "middle" }}
            />{" "}
            Guided Learning Mode
          </h2>
          <button className="modal-close" onClick={onClose}>
            <IoCloseOutline />
          </button>
        </div>

        <div
          className="learning-container"
          style={{ padding: "2rem", textAlign: "center" }}
        >
          <div
            style={{
              fontSize: "4rem",
              color: "var(--accent-green)",
              marginBottom: "1rem",
            }}
          >
            <IoSchoolOutline />
          </div>
          <h3>Interactive SQL Course Coming Soon</h3>
          <p
            style={{
              color: "var(--text-secondary)",
              maxWidth: "500px",
              margin: "0 auto 2rem auto",
            }}
          >
            Master SQL with our guided curriculum covering SELECT, JOINs,
            Aggregations, and more. Each topic includes explanation and
            interactive challenges.
          </p>

          <div
            className="learning-topics"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              textAlign: "left",
            }}
          >
            {[
              "SELECT Basics",
              "Filtering Data",
              "Joins & Unions",
              "Aggregations",
              "Subqueries",
              "Window Functions",
            ].map((topic, i) => (
              <div
                key={i}
                style={{
                  padding: "1rem",
                  background: "var(--bg-secondary)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  opacity: 0.7,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                  {i + 1}. {topic}
                </div>
                <div
                  style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}
                >
                  Coming soon
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
