import { Code, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function ApiTutorial() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const apiUrl = window.location.origin;

  return (
    <div className="space-y-6">
      <div className="bg-[#2e3032] rounded-md p-6 border-2 border-[#191919] shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Code className="w-6 h-6 text-[#00a2ff]" />
          <h3 className="text-white font-black text-xl uppercase">API Documentation</h3>
        </div>
        <p className="text-[#b8b8b8] mb-6 font-semibold">
          Use this API endpoint to submit violations from your Roblox game. This is a public endpoint that doesn't require authentication.
        </p>

        <div className="bg-[#393b3d] rounded-md p-6 border-2 border-[#191919] mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-black text-lg uppercase">Submit Violation</h4>
            <span className="bg-[#4caf50] text-white px-4 py-1.5 rounded-md text-sm font-black border-2 border-[#2e7d32] uppercase">
              POST
            </span>
          </div>
          
          <div className="bg-[#191919] rounded-md p-4 mb-4 font-mono text-sm border-2 border-[#000000]">
            <div className="flex items-center justify-between">
              <span className="text-[#00a2ff] font-semibold">{apiUrl}/api/violations</span>
              <button
                onClick={() => copyToClipboard(`${apiUrl}/api/violations`, "endpoint")}
                className="text-[#b8b8b8] hover:text-white transition transform hover:scale-110"
              >
                {copiedEndpoint === "endpoint" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-white font-bold mb-2 uppercase text-sm">Request Body (JSON):</p>
              <div className="bg-[#191919] rounded-md p-4 relative border-2 border-[#000000]">
                <button
                  onClick={() => copyToClipboard(
                    JSON.stringify({
                      robloxId: "123456789",
                      violationText: "Player was using inappropriate language"
                    }, null, 2),
                    "request"
                  )}
                  className="absolute top-2 right-2 text-[#b8b8b8] hover:text-white transition transform hover:scale-110"
                >
                  {copiedEndpoint === "request" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <pre className="text-[#00a2ff] text-sm overflow-x-auto font-semibold">
{`{
  "robloxId": "123456789",
  "violationText": "Player was using inappropriate language"
}`}
                </pre>
              </div>
            </div>

            <div>
              <p className="text-white font-bold mb-2 uppercase text-sm">Parameters:</p>
              <div className="space-y-2">
                <div className="bg-[#2e3032] rounded-md p-3 border-2 border-[#191919]">
                  <div className="flex items-start gap-3">
                    <span className="bg-[#00a2ff] text-white px-3 py-1 rounded-md text-xs font-mono font-black border-2 border-[#0077b3]">
                      robloxId
                    </span>
                    <div className="flex-1">
                      <p className="text-white text-sm mb-1">
                        <span className="font-black">string</span> · Required
                      </p>
                      <p className="text-[#b8b8b8] text-sm font-semibold">
                        The Roblox user ID of the player who violated the rules
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#2e3032] rounded-md p-3 border-2 border-[#191919]">
                  <div className="flex items-start gap-3">
                    <span className="bg-[#00a2ff] text-white px-3 py-1 rounded-md text-xs font-mono font-black border-2 border-[#0077b3]">
                      violationText
                    </span>
                    <div className="flex-1">
                      <p className="text-white text-sm mb-1">
                        <span className="font-black">string</span> · Required
                      </p>
                      <p className="text-[#b8b8b8] text-sm font-semibold">
                        Description of what rule was violated or what the player did wrong
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-white font-bold mb-2 uppercase text-sm">Response (200 OK):</p>
              <div className="bg-[#191919] rounded-md p-4 border-2 border-[#000000]">
                <pre className="text-[#4caf50] text-sm font-semibold">
{`{
  "success": true
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#393b3d] rounded-md p-6 border-2 border-[#191919]">
          <h4 className="text-white font-black text-lg mb-3 uppercase">Roblox Script Example</h4>
          <p className="text-[#b8b8b8] text-sm mb-4 font-semibold">
            Use this example code in your Roblox game to send violations to the moderation platform:
          </p>
          
          <div className="bg-[#191919] rounded-md p-4 relative border-2 border-[#000000]">
            <button
              onClick={() => copyToClipboard(
                `local HttpService = game:GetService("HttpService")

local function reportViolation(userId, violationText)
    local url = "${apiUrl}/api/violations"
    local data = {
        robloxId = tostring(userId),
        violationText = violationText
    }
    
    local success, response = pcall(function()
        return HttpService:RequestAsync({
            Url = url,
            Method = "POST",
            Headers = {
                ["Content-Type"] = "application/json"
            },
            Body = HttpService:JSONEncode(data)
        })
    end)
    
    if success and response.Success then
        print("Violation reported successfully")
    else
        warn("Failed to report violation:", response)
    end
end

-- Example usage:
-- When a player breaks a rule, call this function
reportViolation(player.UserId, "Player was exploiting")`,
                "script"
              )}
              className="absolute top-2 right-2 text-[#b8b8b8] hover:text-white transition transform hover:scale-110"
            >
              {copiedEndpoint === "script" ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <pre className="text-[#00a2ff] text-sm overflow-x-auto pr-8 font-semibold">
{`local HttpService = game:GetService("HttpService")

local function reportViolation(userId, violationText)
    local url = "${apiUrl}/api/violations"
    local data = {
        robloxId = tostring(userId),
        violationText = violationText
    }
    
    local success, response = pcall(function()
        return HttpService:RequestAsync({
            Url = url,
            Method = "POST",
            Headers = {
                ["Content-Type"] = "application/json"
            },
            Body = HttpService:JSONEncode(data)
        })
    end)
    
    if success and response.Success then
        print("Violation reported successfully")
    else
        warn("Failed to report violation:", response)
    end
end

-- Example usage:
-- When a player breaks a rule, call this function
reportViolation(player.UserId, "Player was exploiting")`}
            </pre>
          </div>

          <div className="mt-4 bg-[#ff9800] border-2 border-[#f57c00] rounded-md p-4">
            <p className="text-white text-sm font-semibold">
              <span className="font-black">IMPORTANT:</span> Make sure HTTP requests are enabled in your Roblox game settings. 
              Go to Game Settings → Security → Allow HTTP Requests and enable it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
