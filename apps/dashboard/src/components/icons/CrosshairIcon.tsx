type CrosshairIconProps = {
  size?: number;
};

export function CrosshairIcon({ size = 28 }: CrosshairIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="14"
        cy="14"
        r="12"
        stroke="var(--accent-info)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <circle
        cx="14"
        cy="14"
        r="4"
        stroke="var(--accent-info)"
        strokeWidth="1.5"
      />
      <line
        x1="14"
        y1="2"
        x2="14"
        y2="8"
        stroke="var(--accent-info)"
        strokeWidth="1.5"
      />
      <line
        x1="14"
        y1="20"
        x2="14"
        y2="26"
        stroke="var(--accent-info)"
        strokeWidth="1.5"
      />
      <line
        x1="2"
        y1="14"
        x2="8"
        y2="14"
        stroke="var(--accent-info)"
        strokeWidth="1.5"
      />
      <line
        x1="20"
        y1="14"
        x2="26"
        y2="14"
        stroke="var(--accent-info)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
