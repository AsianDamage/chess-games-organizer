import React, { useState } from 'react';
import { User, Filter } from 'lucide-react';
import { DateRange, SearchFilters } from '../types';

interface SearchFormProps {
  onSearch: (username: string, range: DateRange, filters: SearchFilters) => void;
  isLoading: boolean;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 20 }, (_, i) => currentYear - i);
const months = [
  { val: 1, label: 'Jan' }, { val: 2, label: 'Feb' }, { val: 3, label: 'Mar' },
  { val: 4, label: 'Apr' }, { val: 5, label: 'May' }, { val: 6, label: 'Jun' },
  { val: 7, label: 'Jul' }, { val: 8, label: 'Aug' }, { val: 9, label: 'Sep' },
  { val: 10, label: 'Oct' }, { val: 11, label: 'Nov' }, { val: 12, label: 'Dec' },
];

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [username, setUsername] = useState('');
  const [range, setRange] = useState<DateRange>({
    startYear: currentYear,
    startMonth: 1,
    endYear: currentYear,
    endMonth: new Date().getMonth() + 1,
  });
  const [opening, setOpening] = useState('');
  const [resultFilter, setResultFilter] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSearch(username.trim(), range, {
        opening: opening.trim(),
        result: resultFilter
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-light text-gray-900 tracking-tight flex items-center justify-center gap-3">
          Chess Games Organizer
        </h2>
        <p className="text-gray-500 text-sm mt-3 font-light">Retrieve game history</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Username</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-gray-900 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all placeholder-gray-400 font-medium"
              placeholder="username"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">From</label>
            <div className="flex gap-2">
              <select
                value={range.startMonth}
                onChange={(e) => setRange({ ...range, startMonth: Number(e.target.value) })}
                className="bg-gray-50 border border-gray-200 rounded-lg py-3 px-2 text-sm text-gray-900 focus:ring-1 focus:ring-gray-900 outline-none w-full"
              >
                {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
              </select>
              <select
                value={range.startYear}
                onChange={(e) => setRange({ ...range, startYear: Number(e.target.value) })}
                className="bg-gray-50 border border-gray-200 rounded-lg py-3 px-2 text-sm text-gray-900 focus:ring-1 focus:ring-gray-900 outline-none w-full"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">To</label>
            <div className="flex gap-2">
              <select
                value={range.endMonth}
                onChange={(e) => setRange({ ...range, endMonth: Number(e.target.value) })}
                className="bg-gray-50 border border-gray-200 rounded-lg py-3 px-2 text-sm text-gray-900 focus:ring-1 focus:ring-gray-900 outline-none w-full"
              >
                {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
              </select>
              <select
                value={range.endYear}
                onChange={(e) => setRange({ ...range, endYear: Number(e.target.value) })}
                className="bg-gray-50 border border-gray-200 rounded-lg py-3 px-2 text-sm text-gray-900 focus:ring-1 focus:ring-gray-900 outline-none w-full"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 mt-2">
            <div className="flex items-center gap-2 mb-3">
                <Filter className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Filters</span>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">Opening Name <span className="text-gray-300 normal-case tracking-normal">(Optional)</span></label>
                    <input 
                        type="text" 
                        placeholder="e.g. Sicilian, London" 
                        value={opening}
                        onChange={(e) => setOpening(e.target.value)}
                        className="w-full bg-white border border-gray-200 border-dashed rounded-lg py-2 px-3 text-sm text-gray-900 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none placeholder-gray-300"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Matches text in PGN headers (e.g. "Queen's Pawn Game: London System")</p>
                </div>
                <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">Game Result <span className="text-gray-300 normal-case tracking-normal">(Optional)</span></label>
                    <select 
                        value={resultFilter}
                        onChange={(e) => setResultFilter(e.target.value)}
                        className="w-full bg-white border border-gray-200 border-dashed rounded-lg py-2 px-3 text-sm text-gray-900 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none"
                    >
                        <option value="all">Any Result</option>
                        <option value="win">Win</option>
                        <option value="loss">Loss (Any)</option>
                        <option value="checkmated">Loss (Checkmated)</option>
                        <option value="resigned">Loss (Resigned)</option>
                        <option value="timeout">Loss (Timeout)</option>
                        <option value="draw">Draw</option>
                    </select>
                </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-lg font-medium tracking-wide text-sm transition-all ${
            isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-black active:scale-[0.99]'
          }`}
        >
          {isLoading ? 'Loading...' : 'Search Games'}
        </button>
      </form>
    </div>
  );
};