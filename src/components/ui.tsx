import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...p
}: {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'soft';
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`btn ${variant} ${className}`} {...p}>
      {children}
    </button>
  );
}

export function IconButton({
  children,
  label,
  ...p
}: {
  children: ReactNode;
  label: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button aria-label={label} title={label} className="iconBtn" {...p}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = '',
  ...p
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card ${className}`} {...p}>
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="sectionHeader">
      <h2>{title}</h2>
      {action && (
        <button className="textBtn" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search music, artists, podcasts',
}: InputHTMLAttributes<HTMLInputElement> & {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="searchInput">
      <span>⌕</span>
      <input value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}
