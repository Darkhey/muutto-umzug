import { useState, useEffect } from 'react';
import { loadingScreenFacts } from '@/lib/loadingScreenFacts';
import './LoadingScreen.css';

const LoadingScreen = () => {
  const [fact, setFact] = useState('');

  useEffect(() => {
    setFact(loadingScreenFacts[Math.floor(Math.random() * loadingScreenFacts.length)]);
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="moving-truck-animation mb-8">
        <div className="truck">
          <div className="cabin"></div>
          <div className="box"></div>
        </div>
        <div className="road"></div>
      </div>
      <p className="text-lg text-muted-foreground animate-pulse">{fact}</p>
    </div>
  );
};

export default LoadingScreen;
