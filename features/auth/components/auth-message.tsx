type AuthMessageProps = {
  message?: string;
};

export function AuthMessage({ message }: AuthMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-foreground" role="status">
      {message}
    </div>
  );
}
