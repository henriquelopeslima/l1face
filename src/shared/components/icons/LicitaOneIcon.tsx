interface LicitaOneIconProps {
  className?: string;
}

export function LicitaOneIcon({ className = "h-6 w-6" }: LicitaOneIconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M11.75 10.75V3.75H4.75V17.75H18.75V10.75H11.75Z"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}
