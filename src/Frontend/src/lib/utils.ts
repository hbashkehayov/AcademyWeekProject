import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

export function formatPricing(price: number, currency: string = 'USD', billingCycle?: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  });

  const formattedPrice = formatter.format(price);
  
  if (billingCycle) {
    return `${formattedPrice}/${billingCycle}`;
  }
  
  return formattedPrice;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getRoleColor(roleName: string): string {
  const colors: Record<string, string> = {
    frontend: 'bg-blue-50 text-blue-700 border-blue-200',
    backend: 'bg-green-50 text-green-700 border-green-200',
    qa: 'bg-purple-50 text-purple-700 border-purple-200',
    designer: 'bg-pink-50 text-pink-700 border-pink-200',
    pm: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    owner: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  
  return colors[roleName.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200';
}

export function getCategoryIcon(categoryName: string): string {
  const icons: Record<string, string> = {
    'code generation': '🤖',
    'testing & qa': '🧪',
    'documentation': '📚',
    'design tools': '🎨',
    'project management': '📋',
    'code review': '👀',
    'devops & ci/cd': '⚙️',
    'database tools': '🗄️',
    'security': '🔒',
    'analytics': '📊',
  };
  
  return icons[categoryName.toLowerCase()] || '🔧';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-red-100 text-red-800',
  };
  
  return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

export function generateStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}