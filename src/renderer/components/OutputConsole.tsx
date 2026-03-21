import { useState, useRef, useEffect, useMemo } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import AnsiToHtml from 'ansi-to-html';
import { useCirceStore } from '../store';
import { OutputLine } from '../../shared/types';

const ansiConverter = new AnsiToHtml({
  fg: '#d4d4d4',
  bg: '#050810',
  colors: {
    0: '#050810',
    1: '#ff453a',
    2: '#30d158',
    3: '#ffd60a',
    4: '#60a5fa',
    5: '#c084fc',
    6: '#22d3ee',
    7: '#d4d4d4'
  }
});

function highlightText(text: string, query: string): string {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(
    new RegExp(`(${escaped})`, 'gi'),
    '<mark style="background:#06b6d4;color:#070b14;border-radius:2px;padding:0 1px">$1</mark>'
  );
}

function OutputLineRow({ line, searchQuery }: { line: OutputLine; searchQuery: string }) {
  const html = useMemo(() => {
    const ansiHtml = ansiConverter.toHtml(line.text);
    return searchQuery ? highlightText(ansiHtml, searchQuery) : ansiHtml;
  }, [line.text, searchQuery]);

  const colorClass =
    line.type === 'stderr'
      ? 'text-red-400'
      : line.type === 'system'
        ? 'text-accent italic'
        : 'text-text-primary';

  return (
    <div className={`px-3 py-px font-mono text-xs leading-5 ${colorClass} hover:bg-white/5`}>
      <span dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export function OutputConsole() {
  const { processes, outputs, clearOutput } = useCirceStore();
  const [activeProcessId, setActiveProcessId] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const processList = Object.values(processes).filter(
    (p) => p.status === 'running' || p.status === 'stopping' || outputs[p.id]?.length
  );

  // Auto-select first process if none selected
  useEffect(() => {
    if (!activeProcessId && processList.length > 0) {
      setActiveProcessId(processList[0].id);
    }
  }, [activeProcessId, processList]);

  const filteredLines = useMemo(() => {
    const lines: OutputLine[] = activeProcessId ? outputs[activeProcessId] || [] : [];
    if (!searchQuery) return lines;
    const lower = searchQuery.toLowerCase();
    return lines.filter((l) => l.text.toLowerCase().includes(lower));
  }, [activeProcessId, outputs, searchQuery]);

  // Auto-scroll on new output (only when not searching)
  useEffect(() => {
    if (autoScroll && !searchQuery && filteredLines.length > 0) {
      virtuosoRef.current?.scrollToIndex({
        index: filteredLines.length - 1,
        behavior: 'smooth'
      });
    }
  }, [filteredLines.length, autoScroll, searchQuery]);

  // Scroll to first match when search query changes
  useEffect(() => {
    if (searchQuery && filteredLines.length > 0) {
      virtuosoRef.current?.scrollToIndex({ index: 0, behavior: 'smooth' });
    }
  }, [searchQuery, filteredLines.length]);

  const activeProcess = activeProcessId ? processes[activeProcessId] : null;
  const totalLines = activeProcessId ? (outputs[activeProcessId]?.length ?? 0) : 0;
  const matchCount = searchQuery ? filteredLines.length : null;

  if (processList.length === 0) {
    return (
      <div className="h-52 min-h-[200px] flex items-center justify-center text-text-tertiary text-sm" style={{ background: '#050810', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        Run a script to see output here
      </div>
    );
  }

  return (
    <div className="h-72 min-h-[200px] flex flex-col" style={{ background: '#050810', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Tab bar */}
      <div className="flex items-center overflow-x-auto flex-shrink-0" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {processList.map((proc) => (
          <button
            key={proc.id}
            onClick={() => setActiveProcessId(proc.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs whitespace-nowrap rounded-md mx-0.5 my-0.5 transition-all duration-150 relative ${
              activeProcessId === proc.id
                ? 'text-accent bg-accent/10'
                : 'text-text-secondary hover:text-text-primary hover:bg-glass-bg'
            }`}
          >
            {proc.status === 'running' && <span className="pulse-dot" />}
            {proc.scriptName}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {activeProcess && (
          <span className={`status-badge status-${activeProcess.status}`}>
            {activeProcess.scriptName} — {activeProcess.status}
          </span>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-40 py-0.5 text-xs"
          />
          {matchCount !== null && (
            <span className={`text-xs ${matchCount === 0 ? 'text-status-error' : 'text-accent'}`}>
              {matchCount}/{totalLines} matches
            </span>
          )}
        </div>
        <label className="flex items-center gap-1 text-xs text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="accent-accent"
          />
          Auto-scroll
        </label>
        {activeProcessId && (
          <button
            onClick={() => clearOutput(activeProcessId)}
            className="btn-ghost px-2 py-0.5 text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Output */}
      <div className="flex-1 min-h-0">
        <Virtuoso
          ref={virtuosoRef}
          data={filteredLines}
          itemContent={(_, line) => <OutputLineRow line={line} searchQuery={searchQuery} />}
          followOutput={autoScroll ? 'smooth' : false}
          className="h-full"
        />
      </div>
    </div>
  );
}
