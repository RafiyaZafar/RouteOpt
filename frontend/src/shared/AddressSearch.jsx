

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AddressSearch({ value, onSelect, onManualPick, onChangeText }) {
  const [q, setQ] = useState(value || '');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setQ(value || '');
  }, [value]);

  async function search(v) {
    setQ(v);
    if (onChangeText) onChangeText(v);

    if (!v) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await axios.get(
        'http://localhost:4000/api/geocode?q=' + encodeURIComponent(v)
      );
      setResults(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <div className="relative">
        <input
          placeholder="Search address or type manually"
          value={q}
          onChange={(e) => search(e.target.value)}
          className="w-full px-4 py-3 border rounded"
        />
        {/* <button
          onClick={onManualPick}
          type="button"
          className="absolute right-2 top-2 bg-slate-200 px-3 py-1 rounded"
        >
          Pick
        </button> */}
      </div>

      {searching && (
        <div className="text-sm text-slate-400 mt-2">Searching…</div>
      )}

      {results.length > 0 && (
        <div className="bg-white border rounded mt-2 max-h-48 overflow-auto">
          {results.map((r) => (
            <div
              key={r.place_id}
              className="p-2 hover:bg-slate-50 cursor-pointer"
              onClick={() => {
                onSelect(r);
                setResults([]);
                setQ(r.display_name);
                if (onChangeText) onChangeText(r.display_name);
              }}
            >
              <div className="text-sm font-medium">{r.display_name}</div>
              <div className="text-xs text-slate-400">
                {r.lat}, {r.lon}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
