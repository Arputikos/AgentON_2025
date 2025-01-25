interface Message {
  text: string;
  sender: string;
  timestamp: string;
}

export default function ChatHistory() {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 h-full">
      <div className="flex items-center space-x-4 mb-8">
        <h3 className="font-semibold text-xl">Debate History</h3>
      </div>
      <div className="border-t pt-6">
        <div className="space-y-4 h-[450px] overflow-y-auto">
          {/* Example messages - will be replaced with real data */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium text-gray-900">Dr. Smith</span>
              <span className="text-sm text-gray-500">10:23 AM</span>
            </div>
            <p className="text-gray-600 text-sm">
              The implementation of AI in healthcare has shown promising results in early diagnosis.
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium text-gray-900">Prof. Johnson</span>
              <span className="text-sm text-gray-500">10:25 AM</span>
            </div>
            <p className="text-gray-600 text-sm">
              However, we must consider the privacy implications and potential biases in the algorithms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 