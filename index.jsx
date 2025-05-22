import React, { useState, useRef, useEffect } from 'react';
import {
  Edit,
  Check,
  ChevronsDown,
  ChevronsUp,
  ArrowRight,
  ArrowUpCircle,
  Loader
} from 'lucide-react';
import { ControlLabel } from 'react-bootstrap';
import './AITextEditor.css';

const OptionButton = ({ label, Icon, onClick, disabled }) => (
  <button className="ai-option-button" onClick={onClick} disabled={disabled}>
    <span>{label}</span>
    <Icon size={16} />
  </button>
);

/**
 * AITextEditor Component
 * - Textarea with selection-based AI options menu
 * - Provides Accept/Reject for AI proposals
 * - Shows Loader during API calls and disables controls
 */
export default function AITextEditor({
  rows = 3,
  placeholder = '',
  onChange,
  value,
  label
}) {
  const [text, setText] = useState(value || '');
  const [selection, setSelection] = useState({
    start: null,
    end: null,
    text: ''
  });
  const [menuVisible, setMenuVisible] = useState(false);
  const [askQuery, setAskQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingText, setPendingText] = useState(null);
  const textareaRef = useRef(null);
  const menuRef = useRef(null);

  const aiOptions = [
    { label: 'Mejora escritura', key: 'improve', Icon: Edit },
    { label: 'Corrige gramática', key: 'fix_grammar', Icon: Check },
    { label: 'Hacer más corto', key: 'shorten', Icon: ChevronsDown },
    { label: 'Hacer más largo', key: 'lengthen', Icon: ChevronsUp },
    { label: 'Continúa escritura', key: 'continue', Icon: ArrowRight }
  ];

  const handleSelection = () => {
    const ta = textareaRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start !== end) {
      const selectedText = ta.value.slice(start, end);
      setSelection({ start, end, text: selectedText });
      setMenuVisible(true);
    } else {
      setMenuVisible(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target)
      ) {
        setMenuVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setText(value || '');
  }, [value]);

  const callAI = async (action, payloadText) => {
    if (!payloadText || payloadText.trim() === '') return;
    setIsLoading(true);
    try {
      const payload = encodeURIComponent(payloadText);
      const context =
        "La startup se llama 'Mismo' y es una empresa de reclutamiento...";
      const length_preference = 'Usa como maximo 50 palabras';
      const res = await fetch(
        `/ai_competitions?action=${action}&text=${payload}&context=${encodeURIComponent(
          context
        )}&length_preference=${encodeURIComponent(length_preference)}`
      );
      const data = await res.json();
      const result = data.result || '';
      const newText =
        text.slice(0, selection.start) + result + text.slice(selection.end);
      setPendingText(newText);
    } catch (err) {
      console.error('AI API error:', err);
    } finally {
      setIsLoading(false);
      setAskQuery('');
      setMenuVisible(false);
    }
  };

  const acceptChange = () => {
    if (pendingText !== null) {
      setText(pendingText);
      onChange?.(pendingText);
      setPendingText(null);
    }
  };

  const rejectChange = () => {
    setPendingText(null);
  };

  return (
    <div className="ai-editor-container">
      {label && (
        <ControlLabel>
          <h4 className="bold editable-label">{label}</h4>
        </ControlLabel>
      )}
      <textarea
        ref={textareaRef}
        className="form-control ai-textarea"
        rows={rows}
        value={pendingText !== null ? pendingText : text}
        onChange={e => setText(e.target.value)}
        onBlur={() => onChange && text !== value && onChange(text)}
        onMouseUp={handleSelection}
        onKeyUp={handleSelection}
        placeholder={placeholder}
      />

      {menuVisible && (
        <div ref={menuRef} className="ai-menu">
          <div className="ai-ask-container">
            <input
              type="text"
              className="ai-ask-input"
              placeholder="Preguntar a la IA..."
              value={askQuery}
              onChange={e => setAskQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && callAI('ask', askQuery)}
              disabled={isLoading}
            />
            <button
              className="ai-ask-button"
              type="button"
              onClick={() => callAI('ask', askQuery)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="rotate" size={16} />
              ) : (
                <ArrowUpCircle color="white" size={16} />
              )}
            </button>
          </div>
          <div>
            {aiOptions.map(opt => (
              <OptionButton
                key={opt.key}
                label={opt.label}
                Icon={opt.Icon}
                onClick={() => callAI(opt.key, selection.text)}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>
      )}

      {pendingText !== null && (
        <div className="d-flex justify-content-end gap-2 mt-2">
          <button
            className="btn btn-sm btn-secondary"
            onClick={rejectChange}
            disabled={isLoading}
          >
            Rechazar
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={acceptChange}
            disabled={isLoading}
          >
            Aceptar
          </button>
        </div>
      )}
    </div>
  );
}
