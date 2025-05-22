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
import classNames from 'classnames';
import './AITextEditor.css';

const OptionButton = ({ label, Icon, onClick, disabled }) => (
  <button 
    className="ai-option-button" 
    onClick={onClick} 
    disabled={disabled}
  >
    <span>{label}</span>
    <Icon size={16} />
  </button>
);

const AITextEditor = ({
  value = '',
  onChange,
  placeholder = 'Empieza a escribir o selecciona texto para ver las opciones de IA...',
  rows = 5
}) => {
  const [text, setText] = useState(value);
  const [selection, setSelection] = useState({ start: null, end: null, text: '' });
  const [menuVisible, setMenuVisible] = useState(false);
  const [askQuery, setAskQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingText, setPendingText] = useState(null);
  
  const textareaRef = useRef(null);
  const menuRef = useRef(null);

  const aiOptions = [
    { label: 'Mejorar escritura', key: 'improve', Icon: Edit },
    { label: 'Corregir gramática', key: 'fix_grammar', Icon: Check },
    { label: 'Hacer más corto', key: 'shorten', Icon: ChevronsDown },
    { label: 'Hacer más largo', key: 'lengthen', Icon: ChevronsUp },
    { label: 'Continuar escritura', key: 'continue', Icon: ArrowRight }
  ];

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target)
      ) {
        setMenuVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleAIAction = async (action, text) => {
    if (!text || text.trim() === '') return;
    
    setIsLoading(true);
    try {
      // Aquí iría la llamada a la API de IA
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      const result = `IA procesó: ${text}`; // Simulación de respuesta
      
      const newText = selection.start !== null
        ? text.slice(0, selection.start) + result + text.slice(selection.end)
        : text + result;
      
      setPendingText(newText);
    } catch (error) {
      console.error('Error en la llamada a la IA:', error);
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
      <textarea
        ref={textareaRef}
        className="ai-textarea"
        rows={rows}
        value={pendingText !== null ? pendingText : text}
        onChange={e => setText(e.target.value)}
        onBlur={() => onChange?.(text)}
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
              placeholder="Pregunta a la IA..."
              value={askQuery}
              onChange={e => setAskQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAIAction('ask', askQuery)}
              disabled={isLoading}
            />
            <button
              className="ai-ask-button"
              onClick={() => handleAIAction('ask', askQuery)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="rotate" size={16} />
              ) : (
                <ArrowUpCircle size={16} />
              )}
            </button>
          </div>
          <div>
            {aiOptions.map(opt => (
              <OptionButton
                key={opt.key}
                label={opt.label}
                Icon={opt.Icon}
                onClick={() => handleAIAction(opt.key, selection.text)}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>
      )}

      {pendingText !== null && (
        <div className="ai-actions">
          <button
            className="ai-action-button secondary"
            onClick={rejectChange}
            disabled={isLoading}
          >
            Rechazar
          </button>
          <button
            className="ai-action-button primary"
            onClick={acceptChange}
            disabled={isLoading}
          >
            Aceptar
          </button>
        </div>
      )}
    </div>
  );
};

export default AITextEditor; 