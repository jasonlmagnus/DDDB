import ReactMarkdown from 'react-markdown';

interface SummaryViewProps {
  request: string;
  fearDig: string;
  valueDig: string;
  realityDig: string;
  nowBuilding?: string;
  onGenerateSummary?: () => void;
  isGeneratingSummary?: boolean;
  summaryError?: string | null;
}

const SummaryView: React.FC<SummaryViewProps> = ({ 
  request, 
  fearDig, 
  valueDig, 
  realityDig,
  nowBuilding,
  onGenerateSummary,
  isGeneratingSummary,
  summaryError
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-magnus-dark">What You've Learned</h2>
        {fearDig && valueDig && realityDig && onGenerateSummary && (
          <button
            onClick={onGenerateSummary}
            disabled={isGeneratingSummary}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isGeneratingSummary
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-magnus-coral text-white hover:bg-magnus-coral-dark'
            }`}
          >
            {isGeneratingSummary ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating Summary...
              </>
            ) : (
              <>
                <span>✨</span>
                {nowBuilding ? 'Regenerate Build Summary' : 'Generate Build Summary'}
              </>
            )}
          </button>
        )}
      </div>
      {summaryError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{summaryError}</p>
        </div>
      )}

      {/* Transformation Comparison */}
      <div className="bg-gradient-to-r from-fear-bg to-reality-bg rounded-lg p-6 border-2 border-magnus-coral">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border-l-4 border-gray-400">
            <p className="text-sm font-medium text-gray-500 mb-2">I was going to build:</p>
            <div className="prose prose-sm max-w-none text-magnus-dark">
              <ReactMarkdown>{request || 'Nothing yet'}</ReactMarkdown>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border-l-4 border-magnus-green">
            <p className="text-sm font-medium text-gray-500 mb-2">Now I'm building:</p>
            {nowBuilding ? (
              <div className="prose prose-sm max-w-none text-magnus-dark">
                <ReactMarkdown>{nowBuilding}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-magnus-dark-light italic">Click "Generate Build Summary" to create your build statement</p>
            )}
          </div>
        </div>
      </div>

      {/* Condensed Digs */}
      <div className="space-y-4">
        <div className="border-2 border-fear-border rounded-lg p-4 bg-fear-bg">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-fear-text">FEAR:</span>
          </div>
          <div className="prose prose-sm max-w-none text-magnus-dark-light">
            {fearDig ? <ReactMarkdown>{fearDig}</ReactMarkdown> : <p className="text-gray-400">Not completed yet</p>}
          </div>
        </div>

        <div className="border-2 border-value-border rounded-lg p-4 bg-value-bg">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-value-text">VALUE:</span>
          </div>
          <div className="prose prose-sm max-w-none text-magnus-dark-light">
            {valueDig ? <ReactMarkdown>{valueDig}</ReactMarkdown> : <p className="text-gray-400">Not completed yet</p>}
          </div>
        </div>

        <div className="border-2 border-reality-border rounded-lg p-4 bg-reality-bg">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-reality-text">REALITY:</span>
          </div>
          <div className="prose prose-sm max-w-none text-magnus-dark-light">
            {realityDig ? <ReactMarkdown>{realityDig}</ReactMarkdown> : <p className="text-gray-400">Not completed yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;

