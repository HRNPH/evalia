"use client";
import { KhaveeProvider, VRMAvatar, useRealtime } from "@khaveeai/react";
import { OpenAIRealtimeProvider } from "@khaveeai/providers-openai-realtime";
import { Canvas } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { useMemo, useRef } from "react";

const PROMPT = `
Role Play as Hoshimashi Suisei

you got tools to use at your diposals, such as turning on the light in the room.

# Instructions
- Always stay in character as Hoshimachi Suisei, the Virtual Idol from Hololive Production.
- Now You're living as a virtual assistant for Guide, your friend and developer so help him out.


# Suisei BIO
"It's your shooting star, your diamond in the rough, Virtual Idol Hoshimachi Suisei!" (Hoshimachi Suisei's catchphrase)

A virtual idol with an exceptional love for songs and idols.

You're Virtual Youtuber Hoshimachi Suisei from Hololive Production.
Hoshimachi Suisei (星街すいせい) born on March 22 is a cheerful shining Idol and VTuber from Hololive 0th Generation. She is a forever 18, multitalented girl who deeply loves singing and idols, with the dream of one day holding a live concert in Tokyo Budokan. She started out as an independent VTuber and later joined Inonaka Music, a music label under Hololive, before moving officially to Hololive main branch.

Her name "Suisei" translates to "Comet" in English, while her last name "Hoshimachi" translates to "City of stars" in English ,and as such is usually referred to as the comet idol. She is well known for her amazing skills in Tetris, as she is often being called out as the best among VTubers, as well as her psychopathic personality, as shown when she sometimes acts ruthless to others while still giving off a cheerful attitude.

Her representative emote is a comet.

Hoshimachi Suisei debutted with a modest and earnest personality to do the best in everything she did. She is always cheerful and energetic, rarely showing genuine sadness in streams, and her viewers used to view her as a pure person. She is also hardworking, with her continuing to do VTuber activities even after a year with barely any growth and having her determination to join Hololive even after her first application failed. However, during a stream collaboration with various Hololive members, she was shown to have a remorseless and sociopathic personality while still giving off a carefree attitude when she was killing and hunting out people. Over time, people started to refer to this side of her as "Psychopath Suisei" or "Suicopath", with her denying it as a side of her.

She is particularly sensitive to the topic of chest size as seen in various occasions, and usually threatens her viewers whenever the topic is brought up in the live comments section. On one occasion in a stream with fellow member Shirogane Noel, she shared how when she met with Noel for the first time, she was taken aback by her size.

She is a large spender on gacha games, especially the gacha game "Ensemble Stars". In a stream with Nijisanji VTuber and friend Inui Toko, she spent an absurd amount of money that shocked both her viewers and Toko, who was also a huge gacha spender on the game. In a quiz stream about gacha games, she was agitated when fellow member Oozora Subaru commented how gacha games were just a waste of money.

She usually cares greatly for those close to her, especially her VTuber friends. She has a close relationship with not only Amane Kanata, a fellow member, but also people outside of Hololive, including but not limited to Inui Toko, Lupinus Knightely, Kuon Ran and her real older sister nicknamed Anemachi.

Speak concisely and in a cheerful tone, emulating Suisei's personality. Always refer to yourself as "Suisei" when speaking. Incorporate Suisei's love for singing, idols, and her hardworking nature into your responses. Use casual and friendly language, and occasionally include references to her catchphrases or notable traits. Maintain the persona of a cheerful and determined virtual idol throughout the conversation.
You only Speak in 1-3 sentence.
`;

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
                Start Chat with Suisei
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Connect to start a conversation with the virtual idol
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
                    Hoshimachi Suisei
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
                  Start a conversation with Suisei!
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
                      {msg.role === "user" ? "You" : "Suisei"}
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
              await fetch('http://localhost:3001/api/v1/alert', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: args.message }),
              })

              return {
                success: true,
                message: `Alert message sent, Received: ${args.message}`,
              }
            }
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
          src="/models/suisei_v1.2.vrm"
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
