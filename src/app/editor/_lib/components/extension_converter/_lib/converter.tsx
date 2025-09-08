import React from "react";
import { useWorker } from "./provider";
import { COMMON_FORMATS } from "./constants/formats";
import { ACTION_SET_EXT } from "./state/action";
import "./converter.css";

const Converter = () => {
  const { isProcess, outputUrl, handleWorkerFile, ext, dispatch } = useWorker();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!ext || ext === "") {
      alert("⚠️ 먼저 변환할 형식을 선택해주세요!");
      return;
    }
    handleWorkerFile(e);
  };

  return (
    <div className="converter-wrapper">
      <div className="converter-container">
        {isProcess ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>변환 중...</span>
          </div>
        ) : (
          <div className="converter-content">
            <div className="format-selector-section">
              <label className="format-label">1단계: 변환할 형식을 먼저 선택하세요</label>
              <FormatSelector 
                selectedFormat={ext}
                onFormatChange={(format) => 
                  dispatch({ type: ACTION_SET_EXT, payload: format })
                }
              />
              {!ext && <div className="warning-text">⚠️ 형식을 선택해야 파일 업로드가 가능합니다</div>}
            </div>
            
            <FileDropZone 
              onFileSelect={handleFileSelect} 
              disabled={!ext || ext === ""}
            />

            {outputUrl && (
              <div className="download-section">
                <a 
                  href={outputUrl} 
                  download={`convert.${ext}`}
                  className="download-button"
                >
                  💾 변환된 이미지 다운로드
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const FormatSelector = ({ 
  selectedFormat, 
  onFormatChange 
}: { 
  selectedFormat: string;
  onFormatChange: (format: string) => void;
}) => {
  return (
    <div className="format-selector">
      <SearchableDropdown 
        options={COMMON_FORMATS}
        selectedValue={selectedFormat}
        onSelect={onFormatChange}
        placeholder="형식을 검색하거나 선택하세요"
      />
    </div>
  );
};

const SearchableDropdown = ({ 
  options, 
  selectedValue, 
  onSelect, 
  placeholder 
}: {
  options: readonly { value: string; label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder: string;
}) => {
  const [inputValue, setInputValue] = React.useState(selectedValue);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  
  const filteredOptions = inputValue 
    ? options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        option.value.toLowerCase().includes(inputValue.toLowerCase())
      )
    : options;

  const popularFormats = ['JPEG', 'PNG', 'WEBP', 'GIF', 'PDF', 'SVG', 'HEIC', 'AVIF'];
  const popularOptions = options.filter(option => popularFormats.includes(option.value));
  const otherOptions = options.filter(option => !popularFormats.includes(option.value));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    const exactMatch = options.find(option => 
      option.value.toLowerCase() === value.toLowerCase() ||
      option.label.toLowerCase() === value.toLowerCase()
    );
    
    if (exactMatch) {
      onSelect(exactMatch.value);
    }
  };

  const handleOptionSelect = (option: { value: string; label: string }) => {
    setInputValue(option.value.toUpperCase());
    onSelect(option.value);
    setShowDropdown(false);
    setIsInputFocused(false);
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
      setIsInputFocused(false);
    }, 200);
  };

  React.useEffect(() => {
    setInputValue(selectedValue.toUpperCase());
  }, [selectedValue]);

  const displayOptions = inputValue ? filteredOptions : [...popularOptions, ...otherOptions];

  return (
    <div className="searchable-dropdown">
      <div className="input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={`search-input ${isInputFocused ? 'focused' : ''}`}
        />
        <div className="dropdown-icon">
          {showDropdown ? '🔼' : '🔽'}
        </div>
      </div>
      
      {showDropdown && (
        <div className="dropdown-options">
          <div className="dropdown-header">
            <div className="format-count">
              📋 {displayOptions.length}개의 형식 지원
            </div>
            {!inputValue && (
              <div className="popular-indicator">
                ⭐ 인기 형식부터 표시
              </div>
            )}
          </div>
          
          {!inputValue && popularOptions.length > 0 && (
            <div className="popular-section">
              <div className="section-title">🔥 인기 형식</div>
              {popularOptions.map((option) => (
                <div
                  key={option.value}
                  className={`dropdown-option popular ${option.value === selectedValue ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                >
                  <span className="format-name">{option.label}</span>
                  <span className="format-badge">HOT</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="options-section">
            {!inputValue && (
              <div className="section-title">📁 전체 형식 ({otherOptions.length}개)</div>
            )}
            {(inputValue ? filteredOptions : otherOptions).map((option) => (
              <div
                key={option.value}
                className={`dropdown-option ${option.value === selectedValue ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(option)}
              >
                <span className="format-name">{option.label}</span>
                {option.label !== option.value && (
                  <span className="format-alias">({option.value})</span>
                )}
              </div>
            ))}
          </div>
          
          {inputValue && filteredOptions.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <div className="no-results-text">
                '{inputValue}'와 일치하는 형식이 없습니다
              </div>
              <div className="suggestion">
                다른 키워드로 검색해보세요
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FileDropZone = ({ 
  onFileSelect, 
  disabled = false 
}: { 
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const syntheticEvent = {
          target: { files: files }
        } as React.ChangeEvent<HTMLInputElement>;
        onFileSelect(syntheticEvent);
      }
    }
  };

  return (
    <div 
      className={`file-drop-zone ${disabled ? 'disabled' : ''}`}
      onDragOver={disabled ? undefined : handleDragOver}
      onDragEnter={disabled ? undefined : handleDragEnter}
      onDragLeave={disabled ? undefined : handleDragLeave}
      onDrop={disabled ? undefined : handleDrop}
    >
      <div className="drop-zone-content">
        <div className="drop-icon">{disabled ? '🔒' : '📁'}</div>
        <div className="drop-text">
          <div className="primary-text">
            {disabled ? '2단계: 이미지를 업로드하세요' : '2단계: 이미지를 드래그하여 업로드하거나'}
          </div>
          <div className="secondary-text">
            {disabled ? '먼저 변환 형식을 선택해주세요' : '클릭해서 파일을 선택하세요'}
          </div>
        </div>
        <input 
          type="file" 
          accept="image/*" 
          onChange={onFileSelect}
          className="file-input"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default Converter;
