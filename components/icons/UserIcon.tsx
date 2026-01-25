'use client';

import * as React from 'react';

type UserIconProps = React.SVGProps<SVGSVGElement> & {
  title?: string;
};

export default function UserIcon({ title, ...props }: UserIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : 'presentation'}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="8" r="4" />
      <path d="M4 22v-1a8 8 0 0 1 16 0v1H4Z" />
    </svg>
  );
}

