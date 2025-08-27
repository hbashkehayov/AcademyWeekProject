'use client';

import { useState, useEffect } from 'react';

interface GreetingCardProps {
  user: {
    name: string;
    display_name: string;
    role: string | { name: string };
    role_id?: number;
  };
}

const roleDisplayNames: { [key: string]: string } = {
  frontend: 'Frontend Developer',
  backend: 'Backend Developer', 
  qa: 'QA Engineer',
  designer: 'UI/UX Designer',
  pm: 'Project Manager',
  owner: 'Owner'
};

const roleDescriptions: { [key: string]: string } = {
  frontend: 'Specialized in user interfaces and client-side development',
  backend: 'Expert in server-side logic, APIs, and database management',
  qa: 'Focused on quality assurance, testing, and automation',
  designer: 'Creative professional in UI/UX design and user experience',
  pm: 'Leading projects and coordinating team efforts',
  owner: 'Strategic oversight and product ownership'
};

export default function GreetingCard({ user }: GreetingCardProps) {
  const [greeting, setGreeting] = useState('Good day');

  useEffect(() => {
    const currentHour = new Date().getHours();
    let newGreeting = 'Good evening';
    
    if (currentHour < 12) {
      newGreeting = 'Good morning';
    } else if (currentHour < 17) {
      newGreeting = 'Good afternoon';
    }
    
    setGreeting(newGreeting);
  }, []);

  // Handle both string role and object role
  const roleName = typeof user.role === 'string' ? user.role : user.role?.name || 'frontend';
  const roleDisplay = roleDisplayNames[roleName] || roleName;
  const roleDescription = roleDescriptions[roleName] || 'Professional team member';

  return (
    <div className="glass-morphism p-6 md:p-8 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-white opacity-80 mb-2">
            {greeting}, {user.display_name}! 👋
          </h2>
          <div className="space-y-1">
            <p className="text-lg text-white opacity-70">
              You're signed in as a <span className="font-semibold text-white opacity-80">{roleDisplay}</span>
            </p>
            <p className="text-sm text-white opacity-60">
              {roleDescription}
            </p>
          </div>
        </div>
        
        {/* Role Badge */}
        <div className="ml-4 flex-shrink-0">
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2">
            <span className="text-sm font-semibold text-white opacity-80">
              {roleDisplay}
            </span>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
        <p className="text-white opacity-70 text-sm leading-relaxed">
          Welcome to your personalized sanctum dashboard! Here you'll find AI tools curated specifically for your role, 
          manage your notes, and explore new tools to enhance your workflow.
        </p>
      </div>
    </div>
  );
}