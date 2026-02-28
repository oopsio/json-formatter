import React, { useState, useEffect, type ChangeEvent } from "react";
import Editor from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import "./App.css";
import { Edit, Minimize2, Copy, Sun, Moon, Upload } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";

const App: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [jsonOutput, setJsonOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Store editor instance
  const [editorInstance, setEditorInstance] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Load history and apply theme
  useEffect(() => {
    const stored = localStorage.getItem("jsonHistory");
    if (stored) setHistory(JSON.parse(stored));
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  // Save formatted JSON to history
  const saveHistory = (formattedJson: string) => {
    if (!formattedJson) return;
    const newHistory = [formattedJson, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem("jsonHistory", JSON.stringify(newHistory));
  };

  // Format JSON using Monaco built-in formatter
  const formatJson = () => {
    setError("");
    if (editorInstance) {
      // Monaco editor is mounted, format using its built-in action
      editorInstance.getAction("editor.action.formatDocument")?.run();
      const formatted = editorInstance.getValue();
      setJsonOutput(formatted);
      saveHistory(formatted);
    } else {
      // fallback: use JSON.parse/stringify if editor not mounted
      try {
        const parsed = JSON.parse(jsonInput);
        const formatted = JSON.stringify(parsed, null, 2);
        setJsonOutput(formatted);
        saveHistory(formatted);
      } catch (e: any) {
        setError(e.message);
        setJsonOutput("");
      }
    }
  };

  // Minify JSON
  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed);
      setJsonOutput(formatted);
      setError("");
      saveHistory(formatted);
    } catch (e: any) {
      setError(e.message);
      setJsonOutput("");
    }
  };

  // Copy output
  const copyJson = () => {
    if (jsonOutput) {
      navigator.clipboard.writeText(jsonOutput);
      alert("Copied to clipboard!");
    }
  };

  // Load JSON from history
  const loadFromHistory = (item: string) => setJsonInput(item);

  // Handle file upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setJsonInput(evt.target?.result as string);
    reader.readAsText(file);
  };

  return (
    
    <div className="container">
      <Analytics />
      <h1>JSON Formatter 🌟</h1>

      {/* Dark/Light Toggle */}
      <button
        className="icon-button"
        onClick={() => setDarkMode(!darkMode)}
        title="Toggle Dark/Light Mode"
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* File Upload */}
      <label className="icon-button" title="Upload JSON file">
        <Upload size={18} />
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
      </label>

      {/* Input Monaco Editor */}
      <Editor
        height="250px"
        defaultLanguage="json"
        value={jsonInput}
        onChange={(value) => setJsonInput(value || "")}
        theme={darkMode ? "vs-dark" : "light"}
        onMount={(editor) => setEditorInstance(editor)}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />

      {/* Action Buttons */}
      <div className="buttons">
        <button className="icon-button" onClick={formatJson} title="Format JSON">
          <Edit size={18} /> Format
        </button>
        <button className="icon-button" onClick={minifyJson} title="Minify JSON">
          <Minimize2 size={18} /> Minify
        </button>
        <button className="icon-button" onClick={copyJson} title="Copy Output">
          <Copy size={18} /> Copy
        </button>
      </div>

      {error && <div className="error">Error: {error}</div>}

      {/* Output Monaco Editor */}
      <Editor
        height="250px"
        defaultLanguage="json"
        value={jsonOutput}
        theme={darkMode ? "vs-dark" : "light"}
        options={{
          readOnly: true,
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />

      {/* History */}
      {history.length > 0 && (
        <div className="history-container">
          <h2>History (click to load)</h2>
          {history.map((item, index) => (
            <div key={index} className="history-item" onClick={() => loadFromHistory(item)}>
              {item.length > 60 ? item.slice(0, 60) + "..." : item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;