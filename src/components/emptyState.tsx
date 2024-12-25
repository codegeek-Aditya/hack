import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <h2 className="text-xl font-semibold text-muted-foreground/80">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default EmptyState;
