'use client';

import { useState, useEffect } from 'react';

interface Note {
  id: string;
  content: string;
  createdAt: Date;
  preview: string;
}

export default function NotesPreview() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    // Load saved notes from localStorage
    const loadSavedNotes = () => {
      const savedNotesData = localStorage.getItem('sanctum_saved_notes');
      if (savedNotesData) {
        try {
          const parsedNotes = JSON.parse(savedNotesData);
          const notesWithPreviews = parsedNotes.map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            preview: note.content.slice(0, 60) + (note.content.length > 60 ? '...' : '')
          }));
          setNotes(notesWithPreviews.slice(0, 2)); // Show only up to 2 notes
        } catch (error) {
          console.error('Error parsing saved notes:', error);
          setNotes([]);
        }
      } else {
        setNotes([]);
      }
    };

    loadSavedNotes();

    // Listen for storage changes to update when notes are saved
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sanctum_saved_notes') {
        loadSavedNotes();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from the same page
    const handleNotesUpdate = () => {
      loadSavedNotes();
    };
    
    window.addEventListener('notesUpdated', handleNotesUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notesUpdated', handleNotesUpdate);
    };
  }, []);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday'; 
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="glass-morphism p-6 rounded-3xl">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white opacity-80 mb-2">
          Notes Saved
        </h3>
        <p className="text-sm text-white opacity-60">
          Your recent thoughts and ideas
        </p>
      </div>

      {notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map((note) => (
            <div 
              key={note.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-white opacity-60">
                  {formatDate(note.createdAt)}
                </span>
                <div className="w-2 h-2 bg-white/40 rounded-full flex-shrink-0" />
              </div>
              
              <p className="text-sm text-white opacity-70 leading-relaxed">
                {note.preview}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
          <div className="text-4xl mb-3 opacity-60">📝</div>
          <p className="text-sm text-white opacity-60">
            No notes saved yet
          </p>
          <p className="text-xs text-white opacity-50 mt-2">
            Start writing in the notes section
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-white/20">
        <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full py-2 text-sm font-medium text-white opacity-80 transition-colors duration-200 flex items-center justify-center space-x-2">
          <span>More</span>
          <svg 
            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
}