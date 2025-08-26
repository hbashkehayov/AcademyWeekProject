interface ActionButtonsProps {
  onReviewTools?: () => void;
  onAddTool?: () => void;
}

export default function ActionButtons({ onReviewTools, onAddTool }: ActionButtonsProps) {
  const actions = [
    {
      title: 'Review AI Tools',
      description: 'Browse and discover new AI tools for your workflow',
      icon: '🔍',
      color: 'from-blue-500/20 to-purple-500/20',
      hoverColor: 'hover:from-blue-500/30 hover:to-purple-500/30'
    },
    {
      title: 'Add AI Tool',
      description: 'Submit a new AI tool to our curated collection',
      icon: '➕',
      color: 'from-green-500/20 to-emerald-500/20',
      hoverColor: 'hover:from-green-500/30 hover:to-emerald-500/30'
    },
    {
      title: 'AI Assistant',
      description: 'Get personalized recommendations and support',
      icon: '🤖',
      color: 'from-orange-500/20 to-red-500/20',
      hoverColor: 'hover:from-orange-500/30 hover:to-red-500/30'
    }
  ];

  const handleAction = (actionTitle: string) => {
    switch (actionTitle) {
      case 'Review AI Tools':
        if (onReviewTools) {
          onReviewTools();
        }
        break;
      case 'Add AI Tool':
        if (onAddTool) {
          onAddTool();
        }
        break;
      default:
        console.log(`Action clicked: ${actionTitle}`);
        break;
    }
  };

  return (
    <div className="glass-morphism p-6 rounded-3xl">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white opacity-80 mb-2">
          Quick Actions
        </h3>
        <p className="text-sm text-white opacity-60">
          Explore, contribute, and get AI assistance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleAction(action.title)}
            className={`group relative overflow-hidden bg-gradient-to-br ${action.color} ${action.hoverColor} backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
          >
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                {action.icon}
              </div>
              
              <h4 className="font-bold text-white opacity-80 mb-2 group-hover:opacity-100 transition-opacity duration-300">
                {action.title}
              </h4>
              
              <p className="text-xs text-white opacity-60 leading-relaxed group-hover:opacity-80 transition-opacity duration-300">
                {action.description}
              </p>
            </div>

            {/* Hover indicator */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-60 transition-opacity duration-300">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}