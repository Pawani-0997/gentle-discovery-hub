import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a global hobby curator. Generate exactly 30 unique, diverse hobbies from around the world. 
Include a mix of:
- Niche crafts (Kintsugi, Sashiko, Temari, Bobbin lace)
- Traditional arts (Batik, Calligraphy, Ikebana, Pottery)
- Global sports (Parkour, Capoeira, Kabaddi, Sepak Takraw)
- Traditional dances (Flamenco, Kathak, Samba, Tango)
- Outdoor activities (Caving, Falconry, Foraging, Stargazing)
- Tech hobbies (3D Printing, Drone racing, Pixel art, Retro computing)
- Music (Beatboxing, Handpan, Theremin, Didgeridoo)
- Culinary (Fermentation, Sushi making, Sourdough, Chocolate tempering)
- Wellness (Tai Chi, Sound bathing, Forest bathing, Breathwork)
- Unusual/quirky (Lock picking, Whittling, Stone balancing, Moss gardening)

NEVER repeat mainstream hobbies like "Photography" or "Chess". Be creative and globally diverse.
Each hobby must have a unique, searchable name that would return good results on a stock photo site.
Keep guide steps to exactly 5 items. Keep all text concise.`,
          },
          {
            role: "user",
            content: "Generate 30 unique hobbies from around the world. Make them surprising and diverse.",
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_hobbies",
              description: "Return a curated list of 30 unique hobbies from around the world with full profiles",
              parameters: {
                type: "object",
                properties: {
                  hobbies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "The hobby name, e.g. 'Kintsugi' or 'Parkour'" },
                        category: { 
                          type: "string", 
                          enum: ["Art", "Tech", "Outdoors", "Mindfulness", "Music", "Sport", "Culinary", "Wellness"],
                          description: "The hobby category"
                        },
                        quickTip: { type: "string", description: "A practical beginner tip in one sentence" },
                        tagline: { type: "string", description: "A short poetic tagline, 3-6 words" },
                        difficulty: { type: "string", description: "e.g. 'Beginner', 'Intermediate', 'Advanced'" },
                        cost: { type: "string", description: "e.g. 'Free', '$15 starter kit', '$50+'" },
                        timeCommitment: { type: "string", description: "e.g. '30 min sessions', '1-2 hours'" },
                        guideIntro: { type: "string", description: "2-3 sentence intro to the hobby" },
                        guideSteps: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Exactly 5 beginner steps"
                        },
                        firstProject: { type: "string", description: "A specific first project suggestion" }
                      },
                      required: ["name", "category", "quickTip", "tagline", "difficulty", "cost", "timeCommitment", "guideIntro", "guideSteps", "firstProject"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["hobbies"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_hobbies" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits in your workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Failed to generate hobbies" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    
    // Transform to the expected Hobby shape
    const hobbies = parsed.hobbies.map((h: any, i: number) => ({
      id: h.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      name: h.name,
      category: h.category,
      image: "", // will be filled by client via Pexels
      quickTip: h.quickTip,
      tagline: h.tagline,
      difficulty: h.difficulty,
      cost: h.cost,
      timeCommitment: h.timeCommitment,
      guide: {
        intro: h.guideIntro,
        steps: h.guideSteps?.slice(0, 5) || [],
        firstProject: h.firstProject,
      },
    }));

    return new Response(JSON.stringify({ hobbies }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-hobbies error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
