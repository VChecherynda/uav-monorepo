import { useEffect, useRef, useState } from 'react';

type ConfirmButtonProps = {
  label: string;
  onConfirm: () => void;
  disabled: boolean;
  className: string;
};

const CONFIRM_DURATION_MS = 3000;

export function ConfirmButton({
  label,
  onConfirm,
  disabled,
  className,
}: ConfirmButtonProps) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPressing, setIsPressing] = useState(false);

  const startPressing = () => {
    setIsPressing(true);
    timer.current = setTimeout(() => {
      onConfirm();
      setIsPressing(false);
      timer.current = null;
    }, CONFIRM_DURATION_MS);
  };

  const cleanUp = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const stopPressing = () => {
    setIsPressing(false);
    cleanUp();
  };

  useEffect(() => {
    return cleanUp;
  }, []);

  return (
    <button
      disabled={disabled}
      data-pressing={isPressing}
      onPointerDown={startPressing}
      onPointerUp={stopPressing}
      onPointerLeave={stopPressing}
      onPointerCancel={stopPressing}
      onClick={(e) => e.stopPropagation()}
      style={
        {
          '--confirm-duration': `${CONFIRM_DURATION_MS}ms`,
        } as React.CSSProperties
      }
      className={`btn-confirm ${className}`}
    >
      {label}
    </button>
  );
}
