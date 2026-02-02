import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Shield, AlertTriangle, Users, LogOut, Search, Code, X, Ban, CheckCircle } from "lucide-react";
import UserSearch from "./UserSearch";
import ApiTutorial from "./ApiTutorial";

interface User {
  robloxId: string;
  robloxUsername: string;
  isModerator: boolean;
  isSystemAdmin: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"moderation" | "final" | "moderators" | "search" | "api">("moderation");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        navigate("/login");
        return;
      }
      const userData = await response.json();
      
      if (!userData.isModerator) {
        alert("You are not authorized as a moderator");
        navigate("/login");
        return;
      }
      
      setUser(userData);
    } catch (err) {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#393b3d] flex items-center justify-center">
        <div className="animate-pulse">
          <Shield className="w-16 h-16 text-[#00a2ff]" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#393b3d]">
      <nav className="bg-[#2e3032] border-b-4 border-[#191919] shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#e53935] p-3 rounded-md shadow-md transform hover:scale-105 transition-transform">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-xl tracking-tight">ROBLOX MODERATION</h1>
              <p className="text-[#b8b8b8] text-sm font-semibold">{user.robloxUsername}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-[#191919] hover:bg-[#000000] text-white font-bold px-5 py-2.5 rounded-md border-2 border-[#000000] transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <LogOut className="w-4 h-4" />
            LOGOUT
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab("moderation")}
            className={`flex items-center gap-2 px-6 py-3 rounded-md font-black text-sm uppercase transition-all transform hover:scale-105 shadow-md ${
              activeTab === "moderation"
                ? "bg-[#00a2ff] text-white border-2 border-[#0077b3] shadow-lg"
                : "bg-[#2e3032] text-[#b8b8b8] border-2 border-[#191919] hover:bg-[#3d4043]"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Queue
          </button>
          
          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-2 px-6 py-3 rounded-md font-black text-sm uppercase transition-all transform hover:scale-105 shadow-md ${
              activeTab === "search"
                ? "bg-[#00a2ff] text-white border-2 border-[#0077b3] shadow-lg"
                : "bg-[#2e3032] text-[#b8b8b8] border-2 border-[#191919] hover:bg-[#3d4043]"
            }`}
          >
            <Search className="w-5 h-5" />
            Search
          </button>
          
          {user.isSystemAdmin && (
            <>
              <button
                onClick={() => setActiveTab("final")}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-black text-sm uppercase transition-all transform hover:scale-105 shadow-md ${
                  activeTab === "final"
                    ? "bg-[#00a2ff] text-white border-2 border-[#0077b3] shadow-lg"
                    : "bg-[#2e3032] text-[#b8b8b8] border-2 border-[#191919] hover:bg-[#3d4043]"
                }`}
              >
                <Shield className="w-5 h-5" />
                Final Review
              </button>
              
              <button
                onClick={() => setActiveTab("moderators")}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-black text-sm uppercase transition-all transform hover:scale-105 shadow-md ${
                  activeTab === "moderators"
                    ? "bg-[#00a2ff] text-white border-2 border-[#0077b3] shadow-lg"
                    : "bg-[#2e3032] text-[#b8b8b8] border-2 border-[#191919] hover:bg-[#3d4043]"
                }`}
              >
                <Users className="w-5 h-5" />
                Moderators
              </button>
              
              <button
                onClick={() => setActiveTab("api")}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-black text-sm uppercase transition-all transform hover:scale-105 shadow-md ${
                  activeTab === "api"
                    ? "bg-[#00a2ff] text-white border-2 border-[#0077b3] shadow-lg"
                    : "bg-[#2e3032] text-[#b8b8b8] border-2 border-[#191919] hover:bg-[#3d4043]"
                }`}
              >
                <Code className="w-5 h-5" />
                API
              </button>
            </>
          )}
        </div>

        <div className="animate-fadeIn">
          {activeTab === "moderation" && <ModerationTab />}
          {activeTab === "search" && <UserSearch />}
          {activeTab === "final" && user.isSystemAdmin && <FinalReviewTab />}
          {activeTab === "moderators" && user.isSystemAdmin && <ModeratorsTab />}
          {activeTab === "api" && user.isSystemAdmin && <ApiTutorial />}
        </div>
      </div>
    </div>
  );
}

function ModerationTab() {
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    const response = await fetch("/api/violations/pending");
    const data = await response.json();
    setViolations(data);
    setLoading(false);
  };

  const handleReview = async (id: number, verdict: string) => {
    await fetch(`/api/violations/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verdict }),
    });
    fetchViolations();
  };

  if (loading) {
    return <div className="text-white text-center font-bold">LOADING...</div>;
  }

  const userGroups = violations.reduce((acc: any, v: any) => {
    if (!acc[v.roblox_user_id]) {
      acc[v.roblox_user_id] = {
        username: v.roblox_username,
        violations: [],
      };
    }
    acc[v.roblox_user_id].violations.push(v);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(userGroups).map(([robloxId, data]: [string, any], index) => (
        <div 
          key={robloxId} 
          className="bg-[#2e3032] rounded-md p-6 border-2 border-[#191919] shadow-lg animate-slideIn"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-black text-lg">{data.username}</h3>
              <p className="text-[#b8b8b8] text-sm font-semibold">ID: {robloxId}</p>
            </div>
            <div className="bg-[#ff9800] text-white px-4 py-2 rounded-md font-black text-sm border-2 border-[#f57c00]">
              {data.violations.length} PENDING
            </div>
          </div>
          
          <div className="space-y-3">
            {data.violations.map((v: any) => (
              <div key={v.id} className="bg-[#393b3d] rounded-md p-4 border-2 border-[#191919]">
                <p className="text-white font-semibold mb-3">{v.violation_text}</p>
                <p className="text-[#b8b8b8] text-xs mb-3 font-semibold">
                  REPORTED: {new Date(v.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(v.id, "not_guilty")}
                    className="flex-1 bg-[#4caf50] hover:bg-[#388e3c] text-white font-black py-2.5 rounded-md border-2 border-[#2e7d32] transition-all transform hover:scale-105 shadow-md uppercase text-sm"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Not Guilty
                  </button>
                  <button
                    onClick={() => handleReview(v.id, "guilty")}
                    className="flex-1 bg-[#e53935] hover:bg-[#c62828] text-white font-black py-2.5 rounded-md border-2 border-[#b71c1c] transition-all transform hover:scale-105 shadow-md uppercase text-sm"
                  >
                    <Ban className="w-4 h-4 inline mr-2" />
                    Guilty
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {Object.keys(userGroups).length === 0 && (
        <div className="text-center text-[#b8b8b8] py-12 font-bold text-lg">
          NO PENDING VIOLATIONS
        </div>
      )}
    </div>
  );
}

function FinalReviewTab() {
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<any>(null);
  const [banDuration, setBanDuration] = useState("");

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    const response = await fetch("/api/violations/guilty");
    const data = await response.json();
    setViolations(data);
    setLoading(false);
  };

  const handleBan = async () => {
    if (!selectedUser || !selectedViolation) return;

    await fetch(`/api/users/${selectedUser}/ban`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        violationId: selectedViolation.id,
        durationHours: banDuration ? parseInt(banDuration) : null,
      }),
    });

    setSelectedUser(null);
    setSelectedViolation(null);
    setBanDuration("");
    fetchViolations();
  };

  const handleDismiss = async (violationId: number) => {
    await fetch(`/api/violations/${violationId}/dismiss`, {
      method: "POST",
    });
    fetchViolations();
  };

  if (loading) {
    return <div className="text-white text-center font-bold">LOADING...</div>;
  }

  const userGroups = violations.reduce((acc: any, v: any) => {
    if (!acc[v.roblox_user_id]) {
      acc[v.roblox_user_id] = {
        username: v.roblox_username,
        isBanned: v.is_banned,
        violations: [],
      };
    }
    acc[v.roblox_user_id].violations.push(v);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(userGroups).map(([robloxId, data]: [string, any], index) => (
        <div 
          key={robloxId} 
          className="bg-[#2e3032] rounded-md p-6 border-2 border-[#191919] shadow-lg animate-slideIn"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-black text-lg">{data.username}</h3>
              <p className="text-[#b8b8b8] text-sm font-semibold">ID: {robloxId}</p>
            </div>
            <div className="flex items-center gap-2">
              {data.isBanned && (
                <span className="bg-[#e53935] text-white px-4 py-2 rounded-md font-black text-sm border-2 border-[#b71c1c]">
                  BANNED
                </span>
              )}
              <span className="bg-[#ff9800] text-white px-4 py-2 rounded-md font-black text-sm border-2 border-[#f57c00]">
                {data.violations.length} GUILTY
              </span>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            {data.violations.map((v: any) => (
              <div 
                key={v.id}
                className="bg-[#393b3d] rounded-md p-4 border-2 border-[#191919] relative group"
              >
                <button
                  onClick={() => handleDismiss(v.id)}
                  className="absolute top-2 right-2 bg-[#b8b8b8] hover:bg-[#e53935] text-[#191919] hover:text-white p-1.5 rounded-md transition-all transform hover:scale-110 opacity-50 hover:opacity-100"
                  title="Dismiss violation"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-white font-semibold pr-8">{v.violation_text}</p>
                <p className="text-[#b8b8b8] text-xs mt-2 font-semibold">
                  REPORTED: {new Date(v.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
          
          {!data.isBanned && (
            <div className="bg-[#e53935] rounded-md p-4 border-2 border-[#b71c1c]">
              <h4 className="text-white font-black mb-3 uppercase">Ban User</h4>
              <div className="mb-3">
                <label className="text-white text-sm font-bold block mb-2 uppercase">
                  Duration (hours, empty = permanent)
                </label>
                <input
                  type="number"
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  placeholder="Leave empty for permanent ban"
                  className="w-full bg-[#393b3d] border-2 border-[#191919] rounded-md px-4 py-2 text-white placeholder-[#b8b8b8] font-semibold"
                />
              </div>
              <button
                onClick={handleBan}
                className="w-full bg-[#191919] hover:bg-[#000000] text-white font-black py-3 rounded-md border-2 border-[#000000] transition-all transform hover:scale-105 shadow-md uppercase"
              >
                <Ban className="w-4 h-4 inline mr-2" />
                Confirm Ban
              </button>
            </div>
          )}
        </div>
      ))}
      
      {Object.keys(userGroups).length === 0 && (
        <div className="text-center text-[#b8b8b8] py-12 font-bold text-lg">
          NO GUILTY CASES TO REVIEW
        </div>
      )}
    </div>
  );
}

function ModeratorsTab() {
  const [moderators, setModerators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchModerators();
  }, []);

  const fetchModerators = async () => {
    const response = await fetch("/api/moderators");
    const data = await response.json();
    setModerators(data);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
    const data = await response.json();
    setSearchResults(data);
  };

  const handleAddModerator = async (robloxId: string, username: string) => {
    await fetch("/api/moderators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ robloxId, robloxUsername: username }),
    });
    
    setIsAdding(false);
    setSearchQuery("");
    setSearchResults([]);
    fetchModerators();
  };

  const handleRemoveModerator = async (id: number) => {
    if (!confirm("Remove this moderator?")) return;
    
    await fetch(`/api/moderators/${id}`, { method: "DELETE" });
    fetchModerators();
  };

  if (loading) {
    return <div className="text-white text-center font-bold">LOADING...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#2e3032] rounded-md p-6 border-2 border-[#191919] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black text-lg uppercase">Add Moderator</h3>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-[#00a2ff] hover:bg-[#0077b3] text-white font-black px-5 py-2 rounded-md border-2 border-[#0077b3] transition-all transform hover:scale-105 shadow-md uppercase text-sm"
          >
            {isAdding ? "Cancel" : "Add New"}
          </button>
        </div>
        
        {isAdding && (
          <div className="space-y-3 animate-slideIn">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by username or ID"
                className="flex-1 bg-[#393b3d] border-2 border-[#191919] rounded-md px-4 py-2 text-white placeholder-[#b8b8b8] font-semibold"
              />
              <button
                onClick={handleSearch}
                className="bg-[#00a2ff] hover:bg-[#0077b3] text-white font-black px-6 py-2 rounded-md border-2 border-[#0077b3] transition-all flex items-center gap-2 uppercase text-sm"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="bg-[#393b3d] rounded-md border-2 border-[#191919] max-h-60 overflow-y-auto">
                {searchResults.map((result: any) => (
                  <div
                    key={result.roblox_id}
                    className="flex items-center justify-between p-3 hover:bg-[#2e3032] border-b-2 border-[#191919] last:border-0 transition-colors"
                  >
                    <div>
                      <p className="text-white font-bold">{result.roblox_username}</p>
                      <p className="text-[#b8b8b8] text-sm font-semibold">ID: {result.roblox_id}</p>
                    </div>
                    <button
                      onClick={() => handleAddModerator(result.roblox_id, result.roblox_username)}
                      className="bg-[#4caf50] hover:bg-[#388e3c] text-white font-black px-4 py-1 rounded-md text-sm transition-all border-2 border-[#2e7d32] uppercase"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-[#2e3032] rounded-md p-6 border-2 border-[#191919] shadow-lg">
        <h3 className="text-white font-black text-lg mb-4 uppercase">Current Moderators</h3>
        
        <div className="space-y-2">
          {moderators.map((mod: any, index) => (
            <div 
              key={mod.id} 
              className="flex items-center justify-between bg-[#393b3d] rounded-md p-4 border-2 border-[#191919] animate-slideIn"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div>
                <p className="text-white font-bold">{mod.roblox_username}</p>
                <p className="text-[#b8b8b8] text-sm font-semibold">ID: {mod.roblox_id}</p>
              </div>
              
              <div className="flex items-center gap-3">
                {mod.is_system_admin === 1 && (
                  <span className="bg-[#00a2ff] text-white px-4 py-1.5 rounded-md font-black text-sm border-2 border-[#0077b3] uppercase">
                    Admin
                  </span>
                )}
                {mod.is_system_admin === 0 && (
                  <button
                    onClick={() => handleRemoveModerator(mod.id)}
                    className="bg-[#e53935] hover:bg-[#c62828] text-white font-black px-4 py-1.5 rounded-md text-sm transition-all border-2 border-[#b71c1c] transform hover:scale-105 uppercase"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
