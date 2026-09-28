import { useEffect, useState } from "react";
import { api } from "../services/api";

const GOALS = [
  {
    title: "Reduce Stress",
    icon: "🧘",
    description: "Do something that helps you feel calmer.",
  },
  {
    title: "Connect With Others",
    icon: "🤝",
    description: "Spend meaningful time with family or friends.",
  },
  {
    title: "Help Others",
    icon: "💙",
    description: "Do something helpful for another person.",
  },
  {
    title: "Explore New Places",
    icon: "🌍",
    description: "Visit or explore a new place.",
  },
  {
    title: "Drink Enough Water",
    icon: "💧",
    description: "Keep yourself properly hydrated.",
  },
  {
    title: "Improve Sleep",
    icon: "😴",
    description: "Get good quality and sufficient sleep.",
  },
];

export function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [selectedJournal, setSelectedJournal] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    try {
      setLoading(true);
      setError("");

      const goalResponse = await api.getGoals();
      const journalResponse = await api.getJournals();

      const existingGoals = goalResponse?.goals || [];
      const loadedJournals = journalResponse?.journals || [];

      const finalGoals: any[] = [];

      /*
       * Make sure the six predefined goals exist.
       */
      for (const defaultGoal of GOALS) {
        let goal = existingGoals.find(
          (item: any) =>
            String(item.title).trim().toLowerCase() ===
            defaultGoal.title.trim().toLowerCase()
        );

        if (!goal) {
          try {
            const created = await api.createGoal(
              defaultGoal.title,
              "daily",
              0
            );

            goal = created?.goal;
          } catch (createError) {
            console.error(
              "Could not create goal:",
              defaultGoal.title,
              createError
            );
          }
        }

        if (goal) {
          finalGoals.push(goal);
        }
      }

      setGoals(finalGoals);
      setJournals(loadedJournals);

      if (loadedJournals.length > 0) {
        setSelectedJournal((current) => {
          if (
            current &&
            loadedJournals.some(
              (journal: any) => journal.id === current
            )
          ) {
            return current;
          }

          return loadedJournals[0].id;
        });
      }
    } catch (err: any) {
      console.error("Goals page loading error:", err);

      setError(
        err?.message ||
          "Unable to load the goals page."
      );
    } finally {
      setLoading(false);
    }
  }

  async function analyzeJournal() {
    if (!selectedJournal) {
      setError("Please select a journal entry first.");
      return;
    }

    if (goals.length === 0) {
      setError("No goals are available for analysis.");
      return;
    }

    setAnalyzing(true);
    setMessage("");
    setError("");

    try {
      /*
       * IMPORTANT: send the selected journal ONCE.
       * The server/Gemini evaluates that one journal
       * against all six goals in a single request.
       */
      const result = await api.analyzeJournalAgainstAllGoals(
        selectedJournal
      );

      console.log(
        "Gemini all-goal journal analysis:",
        result
      );

      const verifiedCount = Array.isArray(result?.results)
        ? result.results.filter(
            (item: any) => item?.verified === true
          ).length
        : 0;

      /*
       * Reload goals so the displayed progress comes
       * directly from the persistent database.
       */
      await loadPage();

      if (verifiedCount > 0) {
        setMessage(
          `${verifiedCount} goal${
            verifiedCount === 1 ? "" : "s"
          } verified from this journal.`
        );
      } else {
        setMessage(
          "Analysis completed. No new goal was verified from this journal."
        );
      }
    } catch (err: any) {
      console.error(
        "Journal analysis error:",
        err
      );

      setError(
        err?.message ||
          "Unable to analyze this journal."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            ✨
          </div>

          <h2 style={styles.loadingTitle}>
            Loading Goals
          </h2>

          <p style={styles.loadingText}>
            Preparing your daily wellness goals...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              DAILY WELLNESS
            </div>

            <h1 style={styles.mainTitle}>
              Your Goals
            </h1>

            <p style={styles.subtitle}>
              Let AI analyze your journal and identify
              meaningful progress toward your daily goals.
            </p>
          </div>

          <div style={styles.goalCountCard}>
            <div style={styles.goalCount}>
              6
            </div>

            <div style={styles.goalCountText}>
              Daily Goals
            </div>
          </div>
        </div>

        {/* ANALYSIS CARD */}
        <div style={styles.analysisCard}>
          <div style={styles.analysisIcon}>
            ✨
          </div>

          <div style={styles.analysisContent}>
            <h2 style={styles.analysisTitle}>
              Analyze Your Journal
            </h2>

            <p style={styles.analysisDescription}>
              Select a journal entry and let Gemini
              analyze it against your six daily goals.
              Only evidence supported by your journal
              should increase your progress.
            </p>

            <div style={styles.analysisRow}>
              <select
                value={selectedJournal}
                onChange={(event) =>
                  setSelectedJournal(event.target.value)
                }
                disabled={analyzing}
                style={styles.select}
              >
                <option value="">
                  Select a journal entry
                </option>

                {journals.map((journal: any) => {
                  const text =
                    journal.content ||
                    journal.text ||
                    "Journal entry";

                  return (
                    <option
                      key={journal.id}
                      value={journal.id}
                    >
                      {text.length > 100
                        ? `${text.substring(0, 100)}...`
                        : text}
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={analyzeJournal}
                disabled={
                  analyzing ||
                  !selectedJournal
                }
                style={{
                  ...styles.analyzeButton,
                  opacity:
                    analyzing ||
                    !selectedJournal
                      ? 0.6
                      : 1,
                  cursor:
                    analyzing ||
                    !selectedJournal
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {analyzing
                  ? "Analyzing..."
                  : "✨ Analyze Journal"}
              </button>
            </div>

            {message && (
              <div style={styles.successMessage}>
                ✓ {message}
              </div>
            )}

            {error && (
              <div style={styles.errorMessage}>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* JOURNAL PREVIEW */}
        {selectedJournal && (
          <div style={styles.previewCard}>
            <div style={styles.previewLabel}>
              SELECTED JOURNAL
            </div>

            <p style={styles.previewText}>
              "
              {(() => {
                const journal = journals.find(
                  (item: any) =>
                    item.id === selectedJournal
                );

                return (
                  journal?.content ||
                  journal?.text ||
                  ""
                );
              })()}
              "
            </p>
          </div>
        )}

        {/* SECTION TITLE */}
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Today's Goals
            </h2>

            <p style={styles.sectionSubtitle}>
              Progress is updated only after journal
              evidence is verified.
            </p>
          </div>
        </div>

        {/* GOAL CARDS */}
        <div style={styles.goalGrid}>
          {GOALS.map((defaultGoal) => {
            const actualGoal = goals.find(
              (goal: any) =>
                String(goal.title)
                  .trim()
                  .toLowerCase() ===
                defaultGoal.title
                  .trim()
                  .toLowerCase()
            );

            const progress = actualGoal
              ? Math.max(
                  0,
                  Math.min(
                    100,
                    Number(actualGoal.progress || 0)
                  )
                )
              : 0;

            return (
              <div
                key={defaultGoal.title}
                style={styles.goalCard}
              >
                <div style={styles.goalHeader}>
                  <div style={styles.goalIcon}>
                    {defaultGoal.icon}
                  </div>

                  <div style={styles.goalNameArea}>
                    <h3 style={styles.goalTitle}>
                      {defaultGoal.title}
                    </h3>

                    <span style={styles.dailyBadge}>
                      DAILY GOAL
                    </span>
                  </div>

                  <div style={styles.progressNumber}>
                    {progress}%
                  </div>
                </div>

                <p style={styles.goalDescription}>
                  {defaultGoal.description}
                </p>

                <div style={styles.progressBackground}>
                  <div
                    style={{
                      ...styles.progressBar,
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <div style={styles.goalFooter}>
                  <span>
                    {progress === 100
                      ? "Goal completed"
                      : progress > 0
                      ? "Progress verified"
                      : "Waiting for journal evidence"}
                  </span>

                  <span>
                    {progress}/100
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* NO JOURNALS */}
        {journals.length === 0 && (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>
              📖
            </div>

            <h3 style={styles.emptyTitle}>
              No journal entries yet
            </h3>

            <p style={styles.emptyText}>
              Create a journal entry first, then return
              here to analyze it against your goals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f7f9fc 0%, #eef3f7 100%)",
    padding: "35px 25px 60px",
    fontFamily:
      "Inter, Arial, sans-serif",
    color: "#17212b",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "30px",
    marginBottom: "28px",
  },

  eyebrow: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "2px",
    color: "#718096",
  },

  mainTitle: {
    margin: "6px 0",
    fontSize: "40px",
    fontWeight: 800,
    letterSpacing: "-1px",
  },

  subtitle: {
    margin: 0,
    maxWidth: "700px",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#64748b",
  },

  goalCountCard: {
    minWidth: "150px",
    padding: "20px 25px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.05)",
  },

  goalCount: {
    fontSize: "32px",
    fontWeight: 800,
  },

  goalCountText: {
    marginTop: "3px",
    fontSize: "12px",
    color: "#718096",
  },

  analysisCard: {
    display: "flex",
    gap: "20px",
    padding: "25px",
    marginBottom: "18px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    boxShadow:
      "0 10px 30px rgba(15,23,42,0.06)",
  },

  analysisIcon: {
    width: "52px",
    height: "52px",
    minWidth: "52px",
    borderRadius: "16px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
  },

  analysisContent: {
    flex: 1,
  },

  analysisTitle: {
    margin: 0,
    fontSize: "21px",
    fontWeight: 800,
  },

  analysisDescription: {
    margin:
      "7px 0 18px",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  analysisRow: {
    display: "flex",
    gap: "12px",
  },

  select: {
    flex: 1,
    height: "50px",
    padding: "0 14px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "12px",
    background: "#ffffff",
    fontSize: "14px",
    color: "#17212b",
    outline: "none",
  },

  analyzeButton: {
    height: "50px",
    padding: "0 24px",
    border: "none",
    borderRadius: "12px",
    background: "#17212b",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 800,
  },

  successMessage: {
    marginTop: "14px",
    padding: "11px 14px",
    borderRadius: "10px",
    background: "#ecfdf5",
    border:
      "1px solid #a7f3d0",
    color: "#047857",
    fontSize: "13px",
    fontWeight: 700,
  },

  errorMessage: {
    marginTop: "14px",
    padding: "11px 14px",
    borderRadius: "10px",
    background: "#fef2f2",
    border:
      "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: "13px",
    fontWeight: 700,
  },

  previewCard: {
    padding: "18px 20px",
    marginBottom: "30px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "17px",
  },

  previewLabel: {
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "1px",
    color: "#94a3b8",
  },

  previewText: {
    margin:
      "7px 0 0",
    color: "#475569",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  sectionHeader: {
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "25px",
    fontWeight: 800,
  },

  sectionSubtitle: {
    margin:
      "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  goalGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  goalCard: {
    padding: "22px",
    background: "#ffffff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "20px",
    boxShadow:
      "0 7px 24px rgba(15,23,42,0.04)",
  },

  goalHeader: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  goalIcon: {
    width: "50px",
    height: "50px",
    minWidth: "50px",
    borderRadius: "15px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  goalNameArea: {
    flex: 1,
  },

  goalTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: 800,
  },

  dailyBadge: {
    display: "inline-block",
    marginTop: "4px",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "1px",
    color: "#94a3b8",
  },

  progressNumber: {
    fontSize: "21px",
    fontWeight: 800,
  },

  goalDescription: {
    minHeight: "40px",
    margin:
      "17px 0",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  progressBackground: {
    height: "8px",
    background: "#e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    background: "#17212b",
    borderRadius: "10px",
    transition:
      "width 0.4s ease",
  },

  goalFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
    color: "#94a3b8",
    fontSize: "11px",
  },

  emptyCard: {
    marginTop: "25px",
    padding: "45px",
    background: "#ffffff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "20px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "35px",
  },

  emptyTitle: {
    margin:
      "10px 0 5px",
  },

  emptyText: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },

  loadingCard: {
    maxWidth: "450px",
    margin: "120px auto",
    padding: "45px",
    background: "#ffffff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "20px",
    textAlign: "center",
  },

  loadingIcon: {
    fontSize: "35px",
  },

  loadingTitle: {
    margin:
      "10px 0 5px",
  },

  loadingText: {
    margin: 0,
    color: "#64748b",
  },
};