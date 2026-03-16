import * as React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { HomePageQuery } from 'store';

export function Chip(props: { label: string; onDelete: () => void }) {
  const { label, onDelete } = props;
  return (
    <div className='badge badge-ghost gap-2 cursor-default'>
      {label}
      <XMarkIcon
        className='inline-block w-4 h-4 stroke-current cursor-pointer'
        onClick={onDelete}
        tabIndex={0}
      />
    </div>
  );
}

export const FilteredChips = (props: {
  data: HomePageQuery;
  onChange: (q: Partial<HomePageQuery>) => void;
}) => {
  const { data, onChange } = props;
  return (
    <div className='flex flex-wrap items-center justify-start gap-2 pb-4'>
      {data.type && (
        <Chip
          label={`Type: ${data.type.replaceAll(`_nbsp_`, ` `).replaceAll(`_amp_`, `&`)}`}
          onDelete={() => onChange({ type: '' })}
        />
      )}
      {data.sort && (
        <Chip
          label={`Sort: ${data.sort}`}
          onDelete={() => onChange({ sort: '' })}
        />
      )}
    </div>
  );
};
