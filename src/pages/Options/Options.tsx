import React, { useState, useEffect } from 'react';
import './Options.css';

interface Props {
  title: string;
}

const Options: React.FC<Props> = ({ title }) => {
  const [keywords, setKeywords] = useState('');

  // Function to retrieve keywords from Chrome storage
  const getKeywords = () => {
    chrome.storage.sync.get(['keywords'], (result) => {
      if (result.keywords) {
        setKeywords(result.keywords);
      }
    });
  };

  const saveKeywords = () => {
    // Split by commas and newlines, trim whitespace, and filter out any empty strings
    const keywords_array = keywords.split(/[\n,]+/).map(keyword => keyword.trim()).filter(keyword => keyword);

    chrome.storage.sync.set({ keywords: keywords_array }, () => {
      console.log('Keywords saved:', keywords_array);
    });
  };

  // Use effect to get keywords when component mounts
  useEffect(() => {
    getKeywords();
  }, []);

  return (
    <div className="OptionsContainer">
      <h1>{title} Page</h1>
      <textarea
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        placeholder="Enter keywords here..."
      />
      <button onClick={saveKeywords}>Save Keywords</button>
    </div>
  );
};

export default Options;
