interface SuggestedToolsProps {
  userRole: string;
}

// Mock data for AI tools suggestions based on role
const toolSuggestions: { [key: string]: Array<{ name: string; description: string; category: string; pricing: string }> } = {
  frontend: [
    {
      name: 'GitHub Copilot',
      description: 'AI pair programmer that helps you write code faster',
      category: 'Code Generation',
      pricing: '$10/month'
    },
    {
      name: 'Figma AI',
      description: 'AI-powered design tools for better UI/UX',
      category: 'Design Tools', 
      pricing: '$15/month'
    },
    {
      name: 'Tabnine',
      description: 'AI code completion for faster development',
      category: 'Code Generation',
      pricing: '$12/month'
    }
  ],
  backend: [
    {
      name: 'GitHub Copilot',
      description: 'AI pair programmer for backend development',
      category: 'Code Generation',
      pricing: '$10/month'
    },
    {
      name: 'DataDog',
      description: 'AI-powered monitoring and analytics',
      category: 'Analytics',
      pricing: '$70/host/month'
    },
    {
      name: 'SonarQube',
      description: 'AI code quality and security analysis',
      category: 'Code Review',
      pricing: '$150/month'
    }
  ],
  qa: [
    {
      name: 'Cypress',
      description: 'AI-enhanced testing framework',
      category: 'Testing & QA',
      pricing: '$75/month'
    },
    {
      name: 'Postman',
      description: 'API testing with AI insights',
      category: 'Testing & QA',
      pricing: '$29/user/month'
    },
    {
      name: 'SonarQube',
      description: 'Automated code quality testing',
      category: 'Security',
      pricing: '$150/month'
    }
  ],
  designer: [
    {
      name: 'Figma AI',
      description: 'AI-powered design collaboration',
      category: 'Design Tools',
      pricing: '$15/month'
    },
    {
      name: 'ChatGPT',
      description: 'AI assistant for design ideation',
      category: 'Documentation',
      pricing: '$20/month'
    },
    {
      name: 'Claude',
      description: 'AI for design documentation and UX copy',
      category: 'Documentation',
      pricing: '$20/month'
    }
  ],
  pm: [
    {
      name: 'Linear',
      description: 'AI-powered project management',
      category: 'Project Management',
      pricing: '$8/user/month'
    },
    {
      name: 'ChatGPT',
      description: 'AI assistant for project planning',
      category: 'Documentation',
      pricing: '$20/month'
    },
    {
      name: 'Claude',
      description: 'AI for team communication and planning',
      category: 'Documentation',
      pricing: '$20/month'
    }
  ],
  owner: [
    {
      name: 'DataDog',
      description: 'Business analytics and monitoring',
      category: 'Analytics',
      pricing: '$70/host/month'
    },
    {
      name: 'Linear',
      description: 'Strategic project oversight',
      category: 'Project Management',
      pricing: '$8/user/month'
    },
    {
      name: 'SonarQube',
      description: 'Code quality oversight and governance',
      category: 'Security',
      pricing: '$150/month'
    }
  ]
};

export default function SuggestedTools({ userRole }: SuggestedToolsProps) {
  const suggestions = toolSuggestions[userRole] || toolSuggestions.frontend;

  return (
    <div className="glass-morphism p-6 rounded-3xl h-fit">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white opacity-80 mb-2">
          Suggested AI Tools
        </h3>
        <p className="text-sm text-white opacity-60">
          Curated specifically for your role
        </p>
      </div>

      <div className="space-y-4">
        {suggestions.map((tool, index) => (
          <div 
            key={index}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-colors duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-white opacity-80 text-sm">
                {tool.name}
              </h4>
              <span className="text-xs bg-white/20 rounded-full px-2 py-1 text-white opacity-70">
                {tool.category}
              </span>
            </div>
            
            <p className="text-xs text-white opacity-60 mb-3 leading-relaxed">
              {tool.description}
            </p>
            
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-white opacity-70">
                {tool.pricing}
              </span>
              <button className="text-xs bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-3 py-1 text-white opacity-80 transition-colors duration-200">
                Learn More
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/20">
        <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full py-2 text-sm font-medium text-white opacity-80 transition-colors duration-200">
          View All Recommendations
        </button>
      </div>
    </div>
  );
}