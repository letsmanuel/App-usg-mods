import { useState } from "react";
import { Search, AlertTriangle } from "lucide-react";

export default function UserSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
    const data = await response.json();
    setSearchResults(data);
    setLoading(false);
  };

  const handleSelectUser = async (user: any) => {
    setSelectedUser(user);
    setSearchResults([]);
    
    const response = await fetch(`/api/users/${user.roblox_id}/violations`);
    const data = await response.json();
    setViolations(data);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-white font-bold text-lg mb-4">Search User</h3>
        
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by username or Roblox ID"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
            Search
          </button>
        </div>
        
        {searchResults.length > 0 && (
          <div className="bg-white/5 rounded-lg border border-white/10 max-h-60 overflow-y-auto">
            {searchResults.map((result: any) => (
              <button
                key={result.roblox_id}
                onClick={() => handleSelectUser(result)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/10 border-b border-white/5 last:border-0 transition text-left"
              >
                <div>
                  <p className="text-white font-medium">{result.roblox_username}</p>
                  <p className="text-purple-200 text-sm">ID: {result.roblox_id}</p>
                </div>
                <div className="flex items-center gap-3">
                  {result.is_banned === 1 && (
                    <span className="bg-red-600/30 text-red-200 px-3 py-1 rounded-full text-xs">
                      Banned
                    </span>
                  )}
                  <span className="bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full text-xs">
                    {result.violation_count || 0} violations
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-bold text-xl">{selectedUser.roblox_username}</h3>
              <p className="text-purple-200">Roblox ID: {selectedUser.roblox_id}</p>
            </div>
            <div className="flex items-center gap-2">
              {selectedUser.is_banned === 1 && (
                <div className="bg-red-600/30 text-red-200 px-4 py-2 rounded-lg">
                  <p className="font-semibold">BANNED</p>
                  {selectedUser.ban_reason && (
                    <p className="text-xs mt-1">Reason: {selectedUser.ban_reason}</p>
                  )}
                  {selectedUser.ban_duration_hours && (
                    <p className="text-xs">Duration: {selectedUser.ban_duration_hours} hours</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <h4 className="text-white font-semibold">Violations History</h4>
              <span className="bg-purple-600/30 text-purple-200 px-2 py-1 rounded-full text-xs">
                {violations.length} total
              </span>
            </div>
          </div>

          {violations.length === 0 ? (
            <div className="text-center text-white/50 py-8">
              No violations found for this user
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map((violation: any) => (
                <div key={violation.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white flex-1">{violation.violation_text}</p>
                    <div className="ml-4">
                      {violation.status === "pending" && (
                        <span className="bg-yellow-600/30 text-yellow-200 px-3 py-1 rounded-full text-xs">
                          Pending
                        </span>
                      )}
                      {violation.status === "guilty" && (
                        <span className="bg-red-600/30 text-red-200 px-3 py-1 rounded-full text-xs">
                          Guilty
                        </span>
                      )}
                      {violation.status === "not_guilty" && (
                        <span className="bg-green-600/30 text-green-200 px-3 py-1 rounded-full text-xs">
                          Not Guilty
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-purple-200 text-xs">
                    <span>Reported: {new Date(violation.created_at).toLocaleString()}</span>
                    {violation.reviewed_at && (
                      <span>Reviewed: {new Date(violation.reviewed_at).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
