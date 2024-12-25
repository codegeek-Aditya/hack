interface ChartLayoutProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

const ChartLayout = ({ leftContent, rightContent }: ChartLayoutProps) => {
  return (
    <div className="flex h-full w-full">
      {/* Left Sidebar - now uses full width on small screens */}
      <div className="scrollbar flex h-full w-full flex-col rounded-lg py-4 pl-2 lg:w-[70%]">
        <div className="scrollbar h-full space-y-12 overflow-y-auto bg-card px-4">
          {leftContent}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden h-full w-[30%] flex-col border-l lg:flex">
        <div className="h-full overflow-y-auto">
          <div className="sticky top-4 space-y-4 px-4">{rightContent}</div>
        </div>
      </div>
    </div>
  );
};

export default ChartLayout;
