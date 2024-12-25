import React from "react";

const ThemeGuide = () => {
  return (
    <div>
      <div className="mt-12 w-full rounded-lg border bg-background p-6 shadow-lg">
        <div className="space-y-4">
          <div className="rounded bg-primary p-3 text-primary-foreground">
            <div className="text-xs text-primary-foreground">bg-primary</div>
            <div className="text-center text-lg text-primary-foreground">
              text-primary-foreground
            </div>
          </div>

          <div className="rounded border bg-secondary p-3 text-secondary-foreground hover:bg-muted/50">
            <div className="text-xs text-secondary-foreground">
              bg-secondary
            </div>
            <div className="text-center text-lg text-secondary-foreground">
              text-secondary-foreground
            </div>
          </div>

          <div className="rounded bg-muted p-3 text-muted-foreground">
            <div className="text-xs text-muted-foreground">bg-muted</div>
            <div className="text-center text-lg text-muted-foreground">
              text-muted-foreground
            </div>
          </div>

          <div className="rounded border p-3">
            <div className="text-xs">bg-background</div>
            <div className="text-center text-lg">text-foreground</div>
          </div>

          <div className="flex space-x-2">
            <div className="h-8 w-8 rounded border bg-background"></div>
            <div className="h-8 w-8 rounded bg-primary"></div>
            <div className="h-8 w-8 rounded bg-secondary"></div>
            <div className="h-8 w-8 rounded bg-muted"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeGuide;
