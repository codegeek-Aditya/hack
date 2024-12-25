"use client";

export default function GlobalError(
  {
    error,
    reset,
  }: {
    error: Error & { digest?: string };
    reset: () => void;
  } = {} as any,
) {
  if (!error) return null;

  return <div>{null}</div>;
}
