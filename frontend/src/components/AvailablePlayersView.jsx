import React from "react";
import { Link } from "react-router-dom";
import { formatAcademicYear } from "../utils/formatters";

const AvailablePlayersView = ({ availablePlayers = [] }) => {
  const formatPts = (val) => (val || val === 0 ? `${val} Pts` : "-");
  const sorted = availablePlayers
    .slice()
    .sort(
      (a, b) => (b.year || 0) - (a.year || 0) || a.name.localeCompare(b.name)
    );
  return (
    <div>
      {sorted.length === 0 && (
        <p className="text-sm text-gray-400 mb-2">No available players.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((player) => (
          <div
            key={player._id || player.name}
            className="relative flex items-center gap-5 bg-gradient-to-r from-gray-800/85 to-gray-900/85 border rounded-2xl p-4 transition-all duration-300 border-gray-700 hover:border-indigo-400/60 hover:shadow-indigo-500/10"
          >
            <Link
              to={`/player/${player._id}`}
              className="w-16 h-24 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0 ring-1 ring-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <img
                src={player.image}
                alt={player.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <h4 className="text-base sm:text-lg font-semibold text-white truncate tracking-wide">
                <Link
                  to={`/player/${player._id}`}
                  className="hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-sm"
                >
                  {player.name}
                </Link>
              </h4>
              <div className="text-xs sm:text-sm text-gray-300 mt-1 flex flex-wrap gap-2 leading-relaxed">
                <span className="text-yellow-400 font-semibold tracking-wide">
                  {player.category}
                </span>
                {player.year && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-200 font-medium">
                      {formatAcademicYear(player.year)}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-lg sm:text-xl font-extrabold text-indigo-400 tracking-wide">
                {formatPts(player.basePrice)}
              </span>
              <span className="mt-0.5 text-[10px] sm:text-[11px] uppercase text-indigo-400/70 font-semibold tracking-wider">
                Base
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailablePlayersView;
