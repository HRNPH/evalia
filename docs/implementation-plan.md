# Evalia Home Avatar Assistant - Functional Implementation Plan

## Project Overview
Single-user homelab avatar assistant built with KhaveeAI SDK, focused on core functionality without complex user management or authentication.

## Core Functionality Phases

### Phase 1: Character Rendering with KhaveeAI SDK
**Goal**: Display VRM avatar with basic KhaveeAI integration

#### Implementation Tasks:

**Frontend Setup:**
```bash
# Already installed dependencies
# three @react-three/fiber @react-three/drei @khaveeai/react @khaveeai/core
```

**Basic Avatar Component:**
```tsx
import { Canvas } from '@react-three/fiber';
import { KhaveeProvider, VRMAvatar } from '@khaveeai/react';
import { MockProvider } from '@khaveeai/providers-mock';

// Mock provider for development
const config = {
  llm: new MockProvider(),
  voice: new MockProvider(),
};

function App() {
  return (
    <KhaveeProvider config={config}>
      <Canvas camera={{ position: [0, 1.6, 3] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 1, 2]} />
        <VRMAvatar 
          src="/models/eva.vrm" 
          position={[0, 0, 0]}
          scale={[1, 1, 1]}
        />
      </Canvas>
    </KhaveeProvider>
  );
}
```

**Asset Organization:**
- Move VRM from `/public/EVA/` to `/public/models/eva.vrm`
- Create basic lighting setup
- Add camera controls for viewing angle

#### Deliverables:
- ✅ VRM avatar renders on screen
- ✅ KhaveeAI SDK integration working
- ✅ Basic 3D scene with lighting
- ✅ Avatar visible and properly scaled

---

### Phase 2: Speech Input & Voice Recognition
**Goal**: Enable user to speak to avatar and capture speech input

#### Implementation Tasks:

**Frontend Speech Recognition:**
```tsx
import { useState, useEffect } from 'react';

function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
        setIsListening(true);
      }
    }
  };

  return (
    <button 
      onClick={toggleListening}
      className={`px-4 py-2 rounded ${isListening ? 'bg-red-500' : 'bg-blue-500'}`}
    >
      {isListening ? '🎤 Listening...' : '🎤 Start Talking'}
    </button>
  );
}
```

**Text Input Fallback:**
```tsx
function TextInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSubmit(text)}
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 border rounded"
      />
      <button 
        onClick={() => onSubmit(text)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Send
      </button>
    </div>
  );
}
```

#### Deliverables:
- ✅ Voice input button with visual feedback
- ✅ Speech recognition working (with text fallback)
- ✅ Transcribed speech passed to processing
- ✅ Basic UI for input methods

---

### Phase 3: Avatar Voice Response
**Goal**: Avatar speaks back to user with text-to-speech

#### Implementation Tasks:

**KhaveeAI Voice Integration:**
```tsx
import { useVoice } from '@khaveeai/react';

function AvatarSpeaker({ text }: { text: string }) {
  const { speak, speaking } = useVoice();

  const speakWithExpression = async () => {
    // Set talking expression
    const { setExpression } = useVRMExpressions();
    setExpression('talking', 0.8);
    
    try {
      await speak({ 
        text,
        voice: 'female', // or 'male'
        speed: 1.0
      });
    } finally {
      // Reset expression after speaking
      setExpression('talking', 0);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={speakWithExpression}
        disabled={speaking}
        className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        {speaking ? '🗣️ Speaking...' : '🗣️ Speak Response'}
      </button>
    </div>
  );
}
```

**Response Processing:**
```tsx
function ConversationManager() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [currentResponse, setCurrentResponse] = useState('');

  const handleUserInput = async (userText: string) => {
    // Add user message
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);

    // Generate response (mock for now)
    const responseText = await generateResponse(userText);
    
    // Add assistant message
    setMessages([...newMessages, { role: 'assistant', content: responseText }]);
    setCurrentResponse(responseText);
  };

  return (
    <div className="space-y-4">
      <VoiceInput onTranscript={handleUserInput} />
      <TextInput onSubmit={handleUserInput} />
      {currentResponse && (
        <AvatarSpeaker text={currentResponse} />
      )}
      <ConversationHistory messages={messages} />
    </div>
  );
}
```

#### Deliverables:
- ✅ Avatar speaks using KhaveeAI voice
- ✅ Talking expression during speech
- ✅ Response queue and processing
- ✅ Visual feedback for speaking state

---

### Phase 4: Expression & Animation System
**Goal**: Add facial expressions and body animations using KhaveeAI SDK

#### Implementation Tasks:

**Expression Control:**
```tsx
import { useVRMExpressions } from '@khaveeai/react';

function ExpressionControls() {
  const { setExpression, setMultipleExpressions, resetExpressions } = useVRMExpressions();

  const expressions = [
    { name: 'happy', icon: '😊', value: 1.0 },
    { name: 'surprised', icon: '😲', value: 1.0 },
    { name: 'sad', icon: '😢', value: 1.0 },
    { name: 'angry', icon: '😠', value: 1.0 },
    { name: 'neutral', icon: '😐', value: 0 }
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {expressions.map(({ name, icon, value }) => (
        <button
          key={name}
          onClick={() => setExpression(name, value)}
          className="px-3 py-2 bg-purple-500 text-white rounded"
        >
          {icon} {name}
        </button>
      ))}
      <button
        onClick={resetExpressions}
        className="px-3 py-2 bg-gray-500 text-white rounded"
      >
        Reset
      </button>
    </div>
  );
}
```

**Animation Control:**
```tsx
import { useVRMAnimations } from '@khaveeai/react';

function AnimationControls() {
  const { animate, stopAnimation, currentAnimation } = useVRMAnimations();

  const animations = [
    { name: 'idle', icon: '🧍', file: '/animations/idle.fbx' },
    { name: 'walk', icon: '🚶', file: '/animations/walk.fbx' },
    { name: 'talk', icon: '🗣️', file: '/animations/talk.fbx' },
    { name: 'wave', icon: '👋', file: '/animations/wave.fbx' },
    { name: 'dance', icon: '💃', file: '/animations/dance.fbx' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {animations.map(({ name, icon }) => (
          <button
            key={name}
            onClick={() => animate(name)}
            className={`px-3 py-2 rounded ${
              currentAnimation === name 
                ? 'bg-green-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}
          >
            {icon} {name}
          </button>
        ))}
        <button
          onClick={stopAnimation}
          className="px-3 py-2 bg-red-500 text-white rounded"
        >
          ⏹️ Stop
        </button>
      </div>
      <p className="text-sm">Current: {currentAnimation || 'none'}</p>
    </div>
  );
}
```

**Emotion-Based Expression Mapping:**
```tsx
const emotionExpressionMap = {
  happy: { expressions: { happy: 0.8 }, animation: 'dance' },
  surprised: { expressions: { surprised: 0.7 }, animation: 'idle' },
  thinking: { expressions: { neutral: 0.5 }, animation: 'idle' },
  talking: { expressions: { talking: 0.6 }, animation: 'talk' },
  greeting: { expressions: { happy: 0.5 }, animation: 'wave' }
};

function EmotionDrivenResponse({ emotion, text }: { emotion: string, text: string }) {
  const { setMultipleExpressions } = useVRMExpressions();
  const { animate } = useVRMAnimations();

  useEffect(() => {
    const emotionConfig = emotionExpressionMap[emotion as keyof typeof emotionExpressionMap];
    if (emotionConfig) {
      setMultipleExpressions(emotionConfig.expressions);
      animate(emotionConfig.animation);
    }
  }, [emotion, setMultipleExpressions, animate]);

  return <AvatarSpeaker text={text} />;
}
```

#### Deliverables:
- ✅ Expression control panel
- ✅ Animation control system
- ✅ Emotion-to-expression mapping
- ✅ Mixamo animations integrated
- ✅ Context-aware avatar behavior

---

### Phase 5: Tool Calling & Smart Home Integration
**Goal**: Add functionality for avatar to control smart home devices

#### Implementation Tasks:

**Tool System Architecture:**
```tsx
// Define available tools
interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

class LightControlTool implements Tool {
  name = 'control_light';
  description = 'Control smart lights in the house';
  
  parameters = {
    device_id: { type: 'string', required: true },
    action: { type: 'string', enum: ['on', 'off', 'dim'], required: true },
    brightness: { type: 'number', min: 0, max: 100, required: false }
  };

  async execute(params: any) {
    const { device_id, action, brightness } = params;
    
    // Mock implementation for homelab
    console.log(`Controlling light ${device_id}: ${action}${brightness ? ` at ${brightness}%` : ''}`);
    
    // Simulate API call to smart home device
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      device_id,
      status: action === 'on' ? 'on' : 'off',
      brightness: brightness || 100
    };
  }
}

class ThermostatTool implements Tool {
  name = 'set_temperature';
  description = 'Set thermostat temperature';
  
  parameters = {
    temperature: { type: 'number', required: true, min: 60, max: 85 }
  };

  async execute(params: any) {
    const { temperature } = params;
    
    console.log(`Setting thermostat to ${temperature}°F`);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      temperature,
      previous_temperature: 72
    };
  }
}
```

**LLM Tool Integration:**
```tsx
import { useLLM } from '@khaveeai/react';

function ToolEnabledConversation() {
  const { streamChat } = useLLM();
  const [availableTools] = useState([
    new LightControlTool(),
    new ThermostatTool()
  ]);

  const processUserMessage = async (message: string) => {
    // Create system prompt with available tools
    const systemPrompt = `You are a home assistant avatar. Available tools:
${availableTools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

When user requests an action, use the appropriate tool. Respond naturally after executing.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    let response = '';
    let toolCallDetected = false;

    for await (const chunk of streamChat({ 
      messages,
      tools: availableTools 
    })) {
      if (chunk.type === 'tool_call') {
        toolCallDetected = true;
        const tool = availableTools.find(t => t.name === chunk.tool_name);
        if (tool) {
          try {
            const result = await tool.execute(chunk.parameters);
            response = `I've ${chunk.tool_name.replace('_', ' ')}${result.success ? ' successfully' : ' with an error'}.`;
          } catch (error) {
            response = 'Sorry, I had trouble with that request.';
          }
        }
      } else if (chunk.type === 'text' && !toolCallDetected) {
        response += chunk.delta;
      }
    }

    return response;
  };

  return <ConversationInterface onMessage={processUserMessage} />;
}
```

**Mock Smart Home Devices:**
```tsx
// Mock device registry
const mockDevices = {
  living_room_light: { 
    id: 'living_room_light', 
    name: 'Living Room Light', 
    type: 'light',
    status: 'off',
    brightness: 0 
  },
  kitchen_light: { 
    id: 'kitchen_light', 
    name: 'Kitchen Light', 
    type: 'light',
    status: 'on',
    brightness: 80 
  },
  thermostat: { 
    id: 'thermostat', 
    name: 'Home Thermostat', 
    type: 'thermostat',
    current_temp: 72,
    target_temp: 72 
  }
};

function DeviceStatus() {
  const [devices, setDevices] = useState(mockDevices);

  return (
    <div className="space-y-2">
      <h3 className="font-bold">Device Status</h3>
      {Object.values(devices).map(device => (
        <div key={device.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
          <span>{device.name}</span>
          <span className={`px-2 py-1 rounded text-sm ${
            device.status === 'on' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
          }`}>
            {device.status === 'on' ? 'ON' : 'OFF'}
          </span>
        </div>
      ))}
    </div>
  );
}
```

#### Deliverables:
- ✅ Tool calling system integrated with LLM
- ✅ Mock smart home device controls
- ✅ Light control functionality
- ✅ Temperature control functionality
- ✅ Natural language device commands
- ✅ Device status display
- ✅ Avatar provides feedback on actions

---

## Complete System Integration

### Full Avatar Assistant Interface:
```tsx
function EvaliaAssistant() {
  const [phase, setPhase] = useState(1);
  
  return (
    <div className="h-screen flex">
      {/* Left Panel - 3D Avatar */}
      <div className="flex-1">
        <Canvas>
          <KhaveeProvider config={config}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[0, 1, 2]} />
            <VRMAvatar 
              src="/models/eva.vrm"
              animations={{
                idle: '/animations/idle.fbx',
                walk: '/animations/walk.fbx',
                talk: '/animations/talk.fbx',
                wave: '/animations/wave.fbx',
                dance: '/animations/dance.fbx'
              }}
            />
          </KhaveeProvider>
        </Canvas>
      </div>

      {/* Right Panel - Controls */}
      <div className="w-96 bg-gray-50 p-4 space-y-6 overflow-y-auto">
        {/* Voice Input */}
        <div>
          <h2 className="font-bold text-lg mb-2">Voice Input</h2>
          <VoiceInput onTranscript={handleUserInput} />
          <TextInput onSubmit={handleUserInput} />
        </div>

        {/* Expressions */}
        <div>
          <h2 className="font-bold text-lg mb-2">Expressions</h2>
          <ExpressionControls />
        </div>

        {/* Animations */}
        <div>
          <h2 className="font-bold text-lg mb-2">Animations</h2>
          <AnimationControls />
        </div>

        {/* Device Control */}
        <div>
          <h2 className="font-bold text-lg mb-2">Smart Home</h2>
          <DeviceStatus />
          <ToolEnabledConversation />
        </div>

        {/* Conversation History */}
        <div>
          <h2 className="font-bold text-lg mb-2">Conversation</h2>
          <ConversationHistory messages={messages} />
        </div>
      </div>
    </div>
  );
}
```

## Asset Requirements

### VRM Model:
- **Source**: Existing EVA.vrm
- **Location**: `/public/models/eva.vrm`
- **Requirements**: VRM 1.0 with expression support

### Mixamo Animations:
- **idle.fbx**: Breathing idle animation
- **talk.fbx**: Talking with hands
- **wave.fbx**: Greeting/waving
- **dance.fbx**: Entertainment
- **walk.fbx**: Walking animation

### Audio:
- **TTS**: KhaveeAI providers
- **Speech Recognition**: Web Speech API
- **Sound Effects**: Expression transitions

This functional milestone approach focuses on delivering core capabilities incrementally, with each phase building directly on the previous functionality.