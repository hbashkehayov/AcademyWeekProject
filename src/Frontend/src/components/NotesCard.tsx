'use client';

import { useState, useEffect } from 'react';

export default function NotesCard() {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('sanctum_user_notes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  const handleSave = () => {
    if (notes.trim() === '') return;
    
    setIsSaving(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Save to current notes storage
      localStorage.setItem('sanctum_user_notes', notes);
      
      // Also add to saved notes collection
      const existingSavedNotes = localStorage.getItem('sanctum_saved_notes');
      let savedNotes = [];
      
      try {
        savedNotes = existingSavedNotes ? JSON.parse(existingSavedNotes) : [];
      } catch (error) {
        savedNotes = [];
      }
      
      // Create new note entry
      const newNote = {
        id: Date.now().toString(),
        content: notes,
        createdAt: new Date().toISOString()
      };
      
      // Add to beginning of array and keep only last 10 notes
      savedNotes.unshift(newNote);
      savedNotes = savedNotes.slice(0, 10);
      
      // Save updated collection
      localStorage.setItem('sanctum_saved_notes', JSON.stringify(savedNotes));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('notesUpdated'));
      
      setLastSaved(new Date());
      setIsSaving(false);
    }, 500);
  };

  const handleManualSave = () => {
    if (!isSaving) {
      handleSave();
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Saved just now';
    if (minutes < 60) return `Saved ${minutes}m ago`;
    
    return `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="glass-morphism p-6 rounded-3xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white opacity-80">
          Quick Notes
        </h3>
        <div className="flex items-center space-x-2">
          {lastSaved && (
            <span className="text-xs text-white opacity-60">
              {formatLastSaved()}
            </span>
          )}
          <button
            onClick={handleManualSave}
            disabled={isSaving || notes.trim() === ''}
            className="bg-white/20 hover:bg-white/30 disabled:opacity-50 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-white opacity-80 transition-colors duration-200"
          >
            {isSaving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write your thoughts, ideas, or reminders here..."
          className="w-full h-32 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-4 text-white placeholder-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm leading-relaxed"
        />
        
        {/* Character count */}
        <div className="absolute bottom-3 right-3 text-xs text-white opacity-50">
          {notes.length} chars
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setNotes('')}
            className="text-xs text-white opacity-60 hover:opacity-80 transition-opacity duration-200"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}