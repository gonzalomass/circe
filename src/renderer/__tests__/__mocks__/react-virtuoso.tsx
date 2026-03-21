import React from 'react';

export function Virtuoso({ data, itemContent }: {
  data: unknown[];
  itemContent: (index: number, item: unknown) => React.ReactNode;
}) {
  return (
    <div data-testid="virtuoso">
      {data.map((item, i) => (
        <div key={i}>{itemContent(i, item)}</div>
      ))}
    </div>
  );
}

export type VirtuosoHandle = {
  scrollToIndex: (opts: { index: number; behavior?: string }) => void;
};
