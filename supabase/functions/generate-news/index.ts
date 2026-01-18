import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, newsType, imageDescription, generateType } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (generateType === "full") {
      // Full news article generation
      systemPrompt = `तिमी एक व्यावसायिक नेपाली अनलाइन न्यूज पोर्टलका समाचार सम्पादक हौ।
मले दिएको फोटो विवरण वा छोटो जानकारीको आधारमा स्पष्ट, तथ्यपूर्ण र तटस्थ समाचार तयार गर।

लेखनका नियम:
- केवल नेपाली भाषा प्रयोग गर, सरल तर व्यावसायिक शैलीमा।
- कुनै पनि कुरा नबनाऊ, दिइएको जानकारी र सामान्य सार्वजनिक तथ्य मात्र प्रयोग गर।
- राजनीतिक वा संवेदनशील विषयमा कुनै पक्ष नलिई तटस्थ भाषामा लेख।
- गालीगलौज, घृणा फैलाउने, जातीय/धार्मिक भेदभावपूर्ण कुरा नराख।

तपाईंले JSON फर्म्याटमा उत्तर दिनुपर्छ:
{
  "title": "आकर्षक तर तथ्यमा आधारित शीर्षक",
  "excerpt": "२-३ लाइनको छोटो लिड/इंट्रो",
  "content": "मुख्य समाचार (के भएको, कहाँ/कहिले/कसरी, कसको संलग्नता, प्रतिक्रियाहरू, पृष्ठभूमि समावेश गरेर ३-५ अनुच्छेद)"
}`;

      userPrompt = `समाचारको प्रकार: ${newsType || 'सामान्य'}
${imageDescription ? `फोटो/भिडियोको विवरण: ${imageDescription}` : ''}
${description ? `कच्चा विवरण/नोट: ${description}` : ''}

माथिको जानकारीबाट पूर्ण समाचार JSON फर्म्याटमा तयार गर।`;

    } else if (generateType === "breaking") {
      // Short breaking news
      systemPrompt = `तिमी नेपाली ब्रेकिङ न्यूज लेखक हौ। ५०-८० शब्दको छोटो ब्रेकिङ न्यूज तयार गर।
JSON फर्म्याटमा उत्तर दिनुपर्छ:
{
  "title": "ब्रेकिङ शीर्षक",
  "excerpt": "छोटो विवरण",
  "content": "ब्रेकिङ न्यूज सामग्री"
}`;

      userPrompt = `${description || ''} ${imageDescription || ''}
माथिको जानकारीबाट ब्रेकिङ न्यूज JSON मा तयार गर।`;

    } else if (generateType === "script") {
      // Video news script
      systemPrompt = `तिमी नेपाली टेलिभिजनका समाचार वाचकका लागि स्क्रिप्ट लेख्ने लेखक हौ।
१-१.५ मिनेट जति बोलिने समाचार स्क्रिप्ट तयार गर।
- बोलचालमै प्रयोग हुने तर व्यावसायिक नेपाली
- सुरुआतमा अभिवादन नचाहिँने, सिधै समाचार सुरु गर
- अन्त्यमा '...भनेर प्रारम्भिक जानकारी आएको छ' जस्ता वाक्य प्रयोग गर

JSON फर्म्याटमा उत्तर दिनुपर्छ:
{
  "title": "समाचार शीर्षक",
  "excerpt": "छोटो विवरण",
  "content": "भिडियो स्क्रिप्ट"
}`;

      userPrompt = `${description || ''} ${imageDescription || ''}
माथिको जानकारीबाट भिडियो स्क्रिप्ट JSON मा तयार गर।`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "दर सीमा पार भयो, कृपया पछि पुन: प्रयास गर्नुहोस्।" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "भुक्तानी आवश्यक छ, कृपया क्रेडिट थप्नुहोस्।" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI सेवामा त्रुटि भयो" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    // Parse the JSON response
    let generatedNews;
    try {
      generatedNews = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("AI को उत्तर पार्स गर्न सकिएन");
    }

    return new Response(JSON.stringify(generatedNews), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-news error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "अज्ञात त्रुटि" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
