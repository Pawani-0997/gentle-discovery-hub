import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Cpu, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const BEZIER = [0.16, 1, 0.3, 1] as const;

type Message = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT =
  "You are a supportive hobby coach. Help users find low-cost ways to start new hobbies and give them a simple 3-step First Project plan. Be encouraging, concise, and practical. Use markdown formatting for clarity.";

// Offline hobby coach responses when Cloud is unavailable
function getOfflineResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("origami") || lower.includes("paper")) {
    return `### 🦢 Origami — Your 3-Step First Project\n\n1. **Grab a square sheet** — printer paper cut to 6×6 inches works perfectly\n2. **Follow a crane tutorial** — search "origami crane step by step" (15 min)\n3. **Fold 5 cranes** in a row to build muscle memory\n\n💡 *Tip: Crisp creases matter more than fancy paper. Use a ruler edge!*`;
  }
  if (lower.includes("chess")) {
    return `### ♟️ Chess — Your 3-Step First Project\n\n1. **Learn piece movement** on Lichess.org (free, 10 minutes)\n2. **Play 3 games** against the easy bot — focus on controlling the center\n3. **Review one game** with the analysis tool to spot your biggest mistake\n\n💡 *Tip: Don't memorize openings yet. Just ask "is this piece safe?" before every move.*`;
  }
  if (lower.includes("paint") || lower.includes("watercolor") || lower.includes("art") || lower.includes("draw") || lower.includes("sketch")) {
    return `### 🎨 Watercolor Painting — Your 3-Step First Project\n\n1. **Get a $12 travel palette** with 12 pans and one round brush\n2. **Paint a gradient wash** — wet paper, drop in warm yellow, blend to rose\n3. **Paint one simple object** from life (an apple, a leaf, your coffee mug)\n\n💡 *Tip: Start with only 3 colors (red, yellow, blue) — you can mix everything else!*`;
  }
  if (lower.includes("photo")) {
    return `### 📷 Nature Photography — Your 3-Step First Project\n\n1. **Enable grid lines** on your phone camera (rule of thirds)\n2. **Take a 20-min photo walk** — capture 10 small details near home\n3. **Pick your best shot**, crop it, and adjust exposure slightly\n\n💡 *Tip: The golden hour (1h after sunrise, 1h before sunset) makes everything gorgeous.*`;
  }
  if (lower.includes("hik") || lower.includes("outdoor") || lower.includes("trail") || lower.includes("walk")) {
    return `### 🥾 Trail Hiking — Your 3-Step First Project\n\n1. **Find a trail under 2 miles** on AllTrails (flat terrain)\n2. **Bring water + layers** — more than you think you need\n3. **Notice 5 things** you've never seen before and photograph one\n\n💡 *Tip: Comfort builds confidence. Your first hike should feel easy, not epic.*`;
  }
  if (lower.includes("code") || lower.includes("coding") || lower.includes("programming") || lower.includes("develop")) {
    return `### 💻 Coding — Your 3-Step First Project\n\n1. **Try freeCodeCamp** — start with the HTML/CSS intro (free, 1 hour)\n2. **Build a simple personal page** with your name, a photo, and 3 hobbies\n3. **Deploy it** on GitHub Pages so you can share the link\n\n💡 *Tip: Don't pick a language first — pick a project that excites you, then learn the tool.*`;
  }
  if (lower.includes("electronic") || lower.includes("arduino") || lower.includes("circuit")) {
    return `### 🔧 Arduino & Electronics — Your 3-Step First Project\n\n1. **Get an Arduino Uno starter kit** (~$30 online)\n2. **Upload the Blink sketch** — it comes built-in (takes 2 minutes)\n3. **Modify the blink timing** to create a heartbeat pattern\n\n💡 *Tip: An LED + resistor + battery is the "Hello World" of electronics.*`;
  }
  if (lower.includes("budget") || lower.includes("free") || lower.includes("cheap") || lower.includes("cost") || lower.includes("money")) {
    return `### 💰 Best Free Hobbies to Start Today\n\n- **Origami** — just printer paper\n- **Chess** — Lichess.org is 100% free\n- **Hiking** — trails are free, just need shoes\n- **Sketching** — pencil + notebook\n- **Coding** — freeCodeCamp, zero cost\n\n💡 *Pick one that makes you curious, not one that sounds impressive!*`;
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || lower.includes("start")) {
    return `Hey there! 👋 I'm your hobby coach.\n\nI help people find **low-cost, fulfilling hobbies** and give you a simple plan to start today.\n\nTry asking me:\n- *"What's a good free indoor hobby?"*\n- *"Help me start watercolor painting"*\n- *"I want something outdoorsy"*\n\nWhat sounds interesting to you?`;
  }

  return `Great question! Here are some ideas to explore:\n\n### 🌟 Your 3-Step Plan to Find a Hobby\n\n1. **Ask yourself**: Do I want to *make* something or *master* something?\n2. **Try one thing** for just 15 minutes today — no commitment\n3. **Share your first attempt** — imperfection is the point!\n\nWant me to suggest something specific? Tell me:\n- Are you more **creative** or **analytical**?\n- **Indoor** or **outdoor**?\n- What's your budget?`;
}

export default function MentorTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Use offline responses for now (swap to Lovable AI edge function when Cloud is enabled)
    setTimeout(() => {
      const response = getOfflineResponse(trimmed);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsLoading(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <div className="flex flex-col h-[100svh] max-w-md mx-auto">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: BEZIER }}
        >
          <h1 className="text-3xl mb-1">AI Mentor</h1>
          <p className="text-sm text-muted-foreground">Your personal hobby coach</p>
        </motion.div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center h-full text-center pb-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Cpu size={28} className="text-primary" />
            </div>
            <h3 className="text-xl mb-2">Ask me anything about hobbies</h3>
            <p className="text-sm text-muted-foreground max-w-[260px]">
              I'll help you find low-cost ways to start and give you a simple 3-step plan.
            </p>

            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {["How do I start origami?", "Free indoor hobbies", "Help me start painting"].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => {
                      setInput(q);
                      const userMsg: Message = { role: "user", content: q };
                      setMessages((prev) => [...prev, userMsg]);
                      setIsLoading(true);
                      setTimeout(() => {
                        setMessages((prev) => [...prev, { role: "assistant", content: getOfflineResponse(q) }]);
                        setIsLoading(false);
                      }, 800 + Math.random() * 600);
                    }, 50);
                    setInput("");
                  }}
                  className="px-3.5 py-2 bg-card border border-border rounded-full text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: BEZIER }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Cpu size={16} className="text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none text-foreground [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-0 [&_p]:text-sm [&_p]:leading-relaxed [&_li]:text-sm [&_strong]:text-foreground [&_em]:text-muted-foreground">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={16} className="text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Cpu size={16} className="text-primary" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 size={18} className="text-muted-foreground animate-spin" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 pb-28 pt-3 bg-background">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about any hobby..."
            className="flex-1 px-4 py-3.5 bg-card rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3.5 bg-primary text-primary-foreground rounded-lg disabled:opacity-40 cursor-pointer transition-opacity"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
