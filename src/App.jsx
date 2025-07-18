import { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Copy } from "lucide-react";
import "./App.css";

function App() {
  // Custom roll numbers as per user request
  const rollNumbers = [];
  const prefixes = ["J", "K", "L", "M", "N", "O", "P"];
  for (const prefix of prefixes) {
    const startNum = prefix === "J" ? 6 : 0; // Start from J6, others from 0
    const endNum = prefix === "P" ? 6 : 9; // P series ends at 6, others at 9
    for (let i = startNum; i <= endNum; i++) {
      // Skip K6
      if (prefix === "K" && i === 6) continue;
      rollNumbers.push(`22L31A05${prefix}${i}`);
    }
  }

  // Lateral entry roll numbers
  const lateralRollNumbers = [];
  for (let i = 535; i <= 547; i++) {
    lateralRollNumbers.push(`23L35A0${i}`);
  }

  const [present, setPresent] = useState(() => {
    const savedPresent = localStorage.getItem("attendancePresent");
    return savedPresent ? JSON.parse(savedPresent) : [];
  });
  const [markingMode, setMarkingMode] = useState(() => {
    const savedMode = localStorage.getItem("attendanceMode");
    return savedMode || "present";
  });

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const copyToClipboard = useCallback(() => {
    const text = present
      .sort()
      .map((roll) => roll.slice(-3).replace(/O/g, "Ο"))
      .join(", ");
    navigator.clipboard.writeText(text);
    toast.success(
      `${present.length} ${
        markingMode === "present" ? "presenties" : "absenties"
      } copied to clipboard!`
    );
  }, [present, markingMode]);
  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === "c") {
        if (present.length > 0) {
          e.preventDefault();
          copyToClipboard();
        }
      } else if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        setMarkingMode("present");
      } else if (e.ctrlKey && e.key === "a") {
        e.preventDefault();
        setMarkingMode("absent");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [present, copyToClipboard]);

  // Save to localStorage whenever present or markingMode changes
  useEffect(() => {
    localStorage.setItem("attendancePresent", JSON.stringify(present));
  }, [present]);

  useEffect(() => {
    localStorage.setItem("attendanceMode", markingMode);
  }, [markingMode]);

  // Show welcome toast after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.success(" Codja CR", {
        duration: 4000,
        style: {
          background: "#4CAF50",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          padding: "10px 20px",
        },
        icon: "",
      });
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  const handleCheckbox = (roll) => {
    setPresent((prev) =>
      prev.includes(roll) ? prev.filter((r) => r !== roll) : [...prev, roll]
    );
  };

  const clearAll = () => {
    setPresent([]);
    setMarkingMode("present");
    localStorage.removeItem("attendancePresent");
    localStorage.removeItem("attendanceMode");
    toast.success("All data cleared successfully");
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "auto",
        padding: 30,
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <h1
          style={{
            color: "#333",
            fontSize: "2.5rem",
            margin: 0,
          }}
        >
          📋 Salaar CR
        </h1>
        <button
          onClick={clearAll}
          style={{
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            transition: "background-color 0.3s ease",
          }}
          title="Clear all data"
        >
          Clear All
        </button>
      </div>

      <div>
        {/* Marking Mode Toggle */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "20px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
          >
            <button
              type="button"
              onClick={() => setMarkingMode("present")}
              style={{
                backgroundColor: markingMode === "present" ? "#4CAF50" : "#fff",
                color: markingMode === "present" ? "white" : "#333",
                border: "2px solid #4CAF50",
                padding: "10px 20px",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.3s ease",
              }}
            >
              Mark Presenties
            </button>
            <button
              type="button"
              onClick={() => setMarkingMode("absent")}
              style={{
                backgroundColor: markingMode === "absent" ? "#f44336" : "#fff",
                color: markingMode === "absent" ? "white" : "#333",
                border: "2px solid #f44336",
                padding: "10px 20px",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.3s ease",
              }}
            >
              Mark Absenties
            </button>
          </div>
          <p
            style={{
              margin: "10px 0 0 0",
              fontSize: "12px",
              color: "#666",
            }}
          >
            Currently marking selected students as:{" "}
            <strong>{markingMode}</strong>
          </p>
        </div>

        <h1 className="mb-4 text-[18px]">Regular</h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              windowWidth >= 768 ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
            gap: 15,
            marginBottom: 30,
          }}
        >
          {rollNumbers.map((roll) => (
            <div
              key={roll}
              style={{
                backgroundColor: present.includes(roll)
                  ? markingMode === "present"
                    ? "#e8f5e8"
                    : "#fde8e8"
                  : "#fff",
                border: present.includes(roll)
                  ? markingMode === "present"
                    ? "2px solid #4CAF50"
                    : "2px solid #f44336"
                  : "2px solid #ddd",
                borderRadius: "12px",
                padding: "12px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
              onClick={() => handleCheckbox(roll)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  pointerEvents: "none",
                }}
              >
                {roll}
                <input
                  type="checkbox"
                  checked={present.includes(roll)}
                  readOnly
                  style={{
                    marginLeft: 8,
                    transform: "scale(1.2)",
                    accentColor:
                      markingMode === "present" ? "#4CAF50" : "#f44336",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <h1 className="mb-4 text-[18px]">Lateral Entries</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            windowWidth >= 768 ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
          gap: 15,
          marginBottom: 30,
        }}
      >
        {lateralRollNumbers.map((roll) => (
          <div
            key={roll}
            style={{
              backgroundColor: present.includes(roll)
                ? markingMode === "present"
                  ? "#e8f5e8"
                  : "#fde8e8"
                : "#fff",
              border: present.includes(roll)
                ? markingMode === "present"
                  ? "2px solid #4CAF50"
                  : "2px solid #f44336"
                : "2px solid #ddd",
              borderRadius: "12px",
              padding: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
            onClick={() => handleCheckbox(roll)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                pointerEvents: "none",
              }}
            >
              {roll}
              <input
                type="checkbox"
                checked={present.includes(roll)}
                readOnly
                style={{
                  marginLeft: 8,
                  transform: "scale(1.2)",
                  accentColor:
                    markingMode === "present" ? "#4CAF50" : "#f44336",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {present.length > 0 && (
        <div
          style={{
            marginTop: 40,
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: "12px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              color: "#333",
              marginBottom: 15,
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              {markingMode === "present" ? "Presenties" : "Absenties"} (
              {present.length})
            </span>
            <button
              onClick={copyToClipboard}
              style={{
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.3s ease",
              }}
              title="Copy to clipboard"
            >
              <Copy size={16} />
            </button>
          </h3>

          {/* Regular Students */}
          {present.filter((roll) => roll.startsWith("22L31A05")).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4
                style={{ color: "#333", marginBottom: 10, fontSize: "1.1rem" }}
              >
                Regular (
                {present.filter((roll) => roll.startsWith("22L31A05")).length})
              </h4>
              <textarea
                value={present
                  .filter((roll) => roll.startsWith("22L31A05"))
                  .sort()
                  .map((roll) => roll.slice(-3).replace(/O/g, "Ο"))
                  .join(", ")}
                rows={3}
                style={{
                  width: "100%",
                  padding: "15px",
                  fontSize: "14px",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  fontFamily: "Consolas, 'Courier New', monospace",
                  resize: "vertical",
                }}
                readOnly
              />
            </div>
          )}

          {/* Lateral Entries */}
          {present.filter((roll) => roll.startsWith("23L35A0")).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4
                style={{ color: "#333", marginBottom: 10, fontSize: "1.1rem" }}
              >
                Lateral Entries (
                {present.filter((roll) => roll.startsWith("23L35A0")).length})
              </h4>
              <textarea
                value={present
                  .filter((roll) => roll.startsWith("23L35A0"))
                  .sort()
                  .map((roll) => roll.slice(-3).replace(/O/g, "Ο"))
                  .join(", ")}
                rows={3}
                style={{
                  width: "100%",
                  padding: "15px",
                  fontSize: "14px",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  fontFamily: "Consolas, 'Courier New', monospace",
                  resize: "vertical",
                }}
                readOnly
              />
            </div>
          )}

          {/*total*/}
          <div
            style={{
              marginTop: 20,
              padding: 15,
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              <span
                style={{
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "#333",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "14px",
                  }}
                >
                  Total
                </span>
                {rollNumbers.length + lateralRollNumbers.length}
              </span>

              <span
                style={{
                  color: "#4CAF50",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "14px",
                  }}
                >
                  Present
                </span>
                {markingMode === 'present' ? present.length : (rollNumbers.length + lateralRollNumbers.length) - present.length}
              </span>
              <span
                style={{
                  color: "#f44336",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span
                  style={{
                    backgroundColor: "#f44336",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "14px",
                  }}
                >
                  Absent
                </span>
                {markingMode === 'absent' ? present.length : (rollNumbers.length + lateralRollNumbers.length) - present.length}
              </span>
            </div>
          </div>
        </div>
      )}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}

export default App;
