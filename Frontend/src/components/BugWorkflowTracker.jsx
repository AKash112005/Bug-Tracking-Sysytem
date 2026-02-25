export default function BugWorkflowTracker({ status }) {
  const stages = ["open", "assigned", "in-progress", "fixed"];

  const getStageIndex = (stage) => stages.indexOf(stage);
  const currentIndex = getStageIndex(status);

  return (
    <div className="flex items-center justify-between mt-6 mb-4">
      {stages.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={stage} className="flex-1 flex items-center">
            
            {/* Circle */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
            >
              {index + 1}
            </div>

            {/* Line */}
            {index !== stages.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2
                  ${
                    index < currentIndex
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}