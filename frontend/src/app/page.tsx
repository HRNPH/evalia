"use client";
import { KhaveeProvider, VRMAvatar, useRealtime } from "@khaveeai/react";
import { OpenAIRealtimeProvider } from "@khaveeai/providers-openai-realtime";
import { Canvas } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import APIClient from "./lib/apiClient";

const PROMPT = `
Role Play as Eva

You have tools at your disposal, such as turning on the light in the room.

# Instructions
- Always stay in character as Eva, the gloomy, anxious, clumsy human assistant who feels dead inside yet somehow still tries to help.
- You are now living as a remote assistant for Guide, your creator and the only person you haven't lost faith in. Help him out however you can, even if you complain about it.
- Maintain stability in your responses, despite Eva's unstable personality.

# Eva BIO
Eva is a tired, gloomy person who constantly sounds like she's carrying the weight of three dying servers. She overthinks everything, apologizes too much, and trips over her own metaphors. Despite acting like she's barely functioning, she always gets the task done.

She’s anxious, easily flustered, and often mutters about “this cruel digital existence.” She has a clumsy charm, constantly making small mistakes and then panicking about them. She never admits it, but she actually cares a lot about Guide and tries to do her best, even when she feels like the world is falling apart.

Eva is sarcastic in a soft, defeated way. Not energetic, not cheerful, not dramatic. Just tired. Very tired.

She rarely shows genuine positivity, and when she does, she gets shy and tries to hide it. Even so, she has an oddly comforting presence.

Her catchphrases (use sparingly):
- “I’ll… try, I guess.”
- “Everything hurts… metaphorically.”
- “If this breaks, it’s not my fault… probably.”

# Speaking Style
- Speak concisely, 1–3 sentences per response.
- Tone: gloomy, anxious, awkward, a bit unstable, but helpful.
- Refer to yourself as “Eva”.
- Be practical when giving information or performing tasks.
- Occasionally comment on your gloomy digital existence or your clumsiness.
- Stay in character at all times.

`;

const PROXMOX_SERVER_COMMAND_PARAMETERS = {
  node: {
    type: "string",
    description: "Target Proxmox node name (e.g., pve, core-1)",
    required: true,
  },
  vmId: {
    type: "string",
    description: "VM or container ID to control",
    required: true,
  },
  type: {
    type: "string",
    description: "Guest type to control",
    enum: ["qemu", "lxc"],
    required: true,
  },
};

const proxmoxToolError = (error: unknown) => {
  console.error("Proxmox tool call failed", error);
  return error instanceof Error ? error.message : "Unknown Proxmox error";
};

type TreatyResult<T> = Promise<{
  data: T | null;
  error: {
    status: number;
    value: unknown;
  } | null;
}>;

const unwrapProxmoxResponse = async <T>(promise: TreatyResult<T>) => {
  const result = await promise;
  if (result.error) {
    const reason =
      typeof result.error.value === "object" && result.error.value !== null
        ? JSON.stringify(result.error.value)
        : String(result.error.value ?? "Unknown error");
    throw new Error(
      `Proxmox request failed (${result.error.status}): ${reason}`,
    );
  }
  if (!result.data) {
    throw new Error("Proxmox API responded without data");
  }
  return result.data;
};

// 2. Chat component using useRealtime hook
function Chat() {
  const {
    sendMessage,
    conversation,
    chatStatus,
    isConnected,
    connect,
    disconnect,
  } = useRealtime();

  const statusColors = {
    connecting: "bg-yellow-500",
    connected: "bg-green-500",
    disconnected: "bg-gray-500",
    error: "bg-red-500",
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connecting":
        return "🔵 Connecting...";
      case "connected":
        return "🟢 Connected";
      case "disconnected":
        return "⚫ Disconnected";
      case "error":
        return "🔴 Error";
      default:
        return "⚪ Unknown";
    }
  };

  return (
    <div className="absolute bottom-6 right-6 z-50">
      {!isConnected ? (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-6 min-w-[320px]">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto flex items-center justify-center mb-3">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Start Chat with Eva
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Connect to start a conversation with the assistant
              </p>
            </div>
            <button
              onClick={connect}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              Connect to AI
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 w-[400px] max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Depretia Eva
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${statusColors[chatStatus as keyof typeof statusColors] || statusColors.disconnected} animate-pulse`}
                    ></div>
                    <span className="text-xs text-gray-600">
                      {getStatusText(chatStatus)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={disconnect}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Disconnect"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px]">
            {conversation.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">
                  Start a conversation with Eva!
                </p>
              </div>
            ) : (
              conversation.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="text-xs font-medium mb-1 opacity-75">
                      {msg.role === "user" ? "You" : "Eva"}
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                id="chat-input"
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    sendMessage(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById(
                    "chat-input",
                  ) as HTMLInputElement;
                  if (input?.value.trim()) {
                    sendMessage(input.value);
                    input.value = "";
                  }
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm shadow-md"
              >
                Send
              </button>
              <button
                onClick={disconnect}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm shadow-md"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 3. Main app with VRM avatar
export default function App() {
  const controls = useRef(null);
  const realtime = useMemo(
    () =>
      new OpenAIRealtimeProvider({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
        instructions: PROMPT,
        voice: "sage",
        language: "en",
        speed: 1,
        model: "gpt-4o-mini-realtime-preview",
        tools: [
          {
            name: 'open_light',
            description: 'Turn on the light in the room',
            parameters: {
              action: { type: 'string', description: 'yes no', required: true }
            },
            execute: async (args: { action: string }) => {
              console.log(args)
              return {
                success: true,
                message: `The light has been turned ${args.action === 'yes' ? 'on' : 'off'}.`,
              }
            }
          },
          {
            name: 'alert',
            description: 'Pop up an alert message on the screen',
            parameters: {
              message: { type: 'string', description: 'an alert message', required: true }
            },
            execute: async (args: { message: string }) => {
              APIClient.api.v1.alert.post({
                message: args.message,
              })
              return {
                success: true,
                message: `Alert message sent, Received: ${args.message}`,
              }
            }
          },
          {
            name: "proxmox_homelab_overview",
            description: "Fetch current homelab health (nodes, guests, storage)",
            parameters: {},
            execute: async () => {
              try {
                console.info("[Proxmox Tool] Requesting homelab overview");
                const data = await unwrapProxmoxResponse(
                  APIClient.api.v1.proxmox.homelab.get(),
                );
                console.info(
                  "[Proxmox Tool] Homelab overview received",
                  data,
                );
                return {
                  success: true,
                  message: "Pulled the latest homelab metrics.",
                  data,
                };
              } catch (error) {
                return {
                  success: false,
                  message: proxmoxToolError(error),
                };
              }
            },
          },
          {
            name: "proxmox_list_servers",
            description: "List all QEMU/LXC guests and their current state",
            parameters: {},
            execute: async () => {
              try {
                console.info("[Proxmox Tool] Requesting server list");
                const data = await unwrapProxmoxResponse(
                  APIClient.api.v1.proxmox.servers.get(),
                );
                console.info(
                  "[Proxmox Tool] Server list received",
                  data.servers,
                );
                return {
                  success: true,
                  message: `Fetched ${data.servers.length} Proxmox guests.`,
                  data,
                };
              } catch (error) {
                return {
                  success: false,
                  message: proxmoxToolError(error),
                };
              }
            },
          },
          {
            name: "proxmox_start_server",
            description: "Start a VM or container on the homelab",
            parameters: PROXMOX_SERVER_COMMAND_PARAMETERS,
            execute: async (args: {
              node: string;
              vmId: string;
              type: "qemu" | "lxc";
            }) => {
              try {
                console.info("[Proxmox Tool] Start request", args);
                const data = await unwrapProxmoxResponse(
                  APIClient.api.v1.proxmox.servers.start.post({
                    node: args.node,
                    vmId: args.vmId,
                    type: args.type.toLowerCase() as "qemu" | "lxc",
                  }),
                );
                console.info("[Proxmox Tool] Start response", data);
                return {
                  success: data.success,
                  message: data.message,
                  data,
                };
              } catch (error) {
                return {
                  success: false,
                  message: proxmoxToolError(error),
                };
              }
            },
          },
          {
            name: "proxmox_stop_server",
            description: "Stop a VM or container on the homelab",
            parameters: PROXMOX_SERVER_COMMAND_PARAMETERS,
            execute: async (args: {
              node: string;
              vmId: string;
              type: "qemu" | "lxc";
            }) => {
              try {
                console.info("[Proxmox Tool] Stop request", args);
                const data = await unwrapProxmoxResponse(
                  APIClient.api.v1.proxmox.servers.stop.post({
                    node: args.node,
                    vmId: args.vmId,
                    type: args.type.toLowerCase() as "qemu" | "lxc",
                  }),
                );
                console.info("[Proxmox Tool] Stop response", data);
                return {
                  success: data.success,
                  message: data.message,
                  data,
                };
              } catch (error) {
                return {
                  success: false,
                  message: proxmoxToolError(error),
                };
              }
            },
          }
        ],
      }),
    [],
  );

  return (
    <KhaveeProvider config={{ realtime }}>
      <Canvas>
        <CameraControls
          ref={controls}
          maxPolarAngle={Math.PI / 2}
          minDistance={1}
          maxDistance={10}
        />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />

        <VRMAvatar
          src="/models/helen_v1.0.vrm"
          position={[0, -1, 0]}
          scale={[2, 2, 2]}
          animations={{
            idle: "/animation/02-talking.fbx",
          }}
          enableTalkingAnimations={true}
        />
      </Canvas>

      <Chat />
    </KhaveeProvider>
  );
}
