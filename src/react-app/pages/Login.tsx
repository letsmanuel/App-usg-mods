import { Shield, Users, AlertTriangle } from "lucide-react";

export default function Login() {
  const handleLogin = async () => {
    const response = await fetch("/api/auth/roblox/redirect");
    const { redirectUrl } = await response.json();
    window.location.href = redirectUrl;
  };

  return (
    <div className="min-h-screen bg-[#393b3d] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="bg-[#2e3032] rounded-md p-8 shadow-2xl border-4 border-[#191919]">
          <div className="flex justify-center mb-6 animate-pulse">
            <div className="bg-[#e53935] p-5 rounded-md shadow-lg border-2 border-[#b71c1c] transform hover:scale-110 transition-transform">
              <Shield className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-black text-center text-white mb-2 uppercase tracking-tight">
            Roblox Moderation
          </h1>
          <p className="text-center text-[#b8b8b8] mb-8 font-semibold">
            Secure platform for game moderation
          </p>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 bg-[#393b3d] p-3 rounded-md border-2 border-[#191919] transform hover:scale-105 transition-transform">
              <div className="bg-[#00a2ff] p-2 rounded-md border-2 border-[#0077b3]">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-white font-semibold">Review player violations</span>
            </div>
            <div className="flex items-center gap-3 bg-[#393b3d] p-3 rounded-md border-2 border-[#191919] transform hover:scale-105 transition-transform">
              <div className="bg-[#ff9800] p-2 rounded-md border-2 border-[#f57c00]">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-white font-semibold">Manage moderation workflow</span>
            </div>
            <div className="flex items-center gap-3 bg-[#393b3d] p-3 rounded-md border-2 border-[#191919] transform hover:scale-105 transition-transform">
              <div className="bg-[#e53935] p-2 rounded-md border-2 border-[#b71c1c]">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-white font-semibold">System admin controls</span>
            </div>
          </div>
          
          <button
            onClick={handleLogin}
            className="w-full bg-[#00a2ff] hover:bg-[#0077b3] text-white py-4 px-6 rounded-md font-black text-lg border-4 border-[#0077b3] transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 uppercase tracking-wide"
          >
            Login with Roblox
          </button>
          
          <p className="text-center text-xs text-[#b8b8b8] mt-6 font-semibold">
            Only authorized moderators can access this platform
          </p>
        </div>
      </div>
    </div>
  );
}
