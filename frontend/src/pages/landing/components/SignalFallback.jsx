import React from 'react';
import { FileText, ScanSearch } from 'lucide-react';
import { CAREER_SIGNAL_CHAPTERS } from '../careerSignalChapters';

export function SignalFallback({ activeChapter = 0, reason = 'static' }) {
  const chapter = CAREER_SIGNAL_CHAPTERS[activeChapter] ?? CAREER_SIGNAL_CHAPTERS[0];

  return (
    <div className="signal-fallback" data-fallback-reason={reason} aria-label="Sơ đồ tĩnh Career Signal">
      <div className="signal-fallback__document" aria-hidden="true">
        <FileText />
        <span />
        <span />
        <span />
      </div>
      <div className="signal-fallback__path" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="signal-fallback__result">
        <ScanSearch aria-hidden="true" />
        <div>
          <span>{chapter.label}</span>
          <strong>{chapter.outcome}</strong>
        </div>
      </div>
    </div>
  );
}
