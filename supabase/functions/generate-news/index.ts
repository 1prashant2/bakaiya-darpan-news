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
    const { description, newsType, imageDescription, generateType, imageBase64, action } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Handle social media post generation
    if (action === "social_media_posts") {
      console.log("Generating social media posts...");
      const socialResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              content: `तिमी एक सोशल मिडिया विशेषज्ञ हौ। दिइएको समाचार सामग्रीबाट Facebook, Twitter (X), र Instagram का लागि फरक-फरक पोस्ट तयार गर।

नियमहरू:
- Facebook: ३-४ वाक्यको विस्तृत पोस्ट, इमोजी सहित, हैशट्याग सहित
- Twitter: २८० अक्षरभित्रको संक्षिप्त ट्वीट, हैशट्याग सहित
- Instagram: क्याप्शन शैलीमा, इमोजी र हैशट्याग धेरै प्रयोग गर

JSON फर्म्याटमा उत्तर दिनुपर्छ:
{
  "facebook": "फेसबुक पोस्ट",
  "twitter": "ट्विटर पोस्ट",
  "instagram": "इन्स्टाग्राम क्याप्शन"
}`
            },
            {
              role: "user",
              content: `शीर्षक: ${description}\n\nसामग्री: ${imageDescription || ''}\n\nयस समाचारका लागि तीन प्लेटफर्मका पोस्ट JSON मा दिनुहोस्।`
            }
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!socialResponse.ok) {
        const errorText = await socialResponse.text();
        console.error("Social media AI error:", socialResponse.status, errorText);
        throw new Error("सोशल मिडिया पोस्ट तयार गर्न सकिएन");
      }

      const socialData = await socialResponse.json();
      const socialContent = socialData.choices?.[0]?.message?.content;
      const socialPosts = JSON.parse(socialContent);

      return new Response(JSON.stringify(socialPosts), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle SEO optimization suggestions
    if (action === "seo_suggestions") {
      console.log("Generating SEO suggestions...");
      const seoResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              content: `तिमी एक SEO विशेषज्ञ हौ। दिइएको नेपाली समाचार सामग्रीको SEO विश्लेषण गर।

JSON फर्म्याटमा उत्तर दिनुपर्छ:
{
  "meta_description": "१५०-१६० अक्षरको मेटा विवरण",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "readability_score": 85,
  "readability_label": "राम्रो/मध्यम/कमजोर",
  "suggestions": [
    "सुझाव १",
    "सुझाव २",
    "सुझाव ३"
  ],
  "title_score": 80,
  "title_suggestions": "शीर्षकका लागि सुझाव",
  "word_count": 250,
  "estimated_read_time": "२ मिनेट"
}`
            },
            {
              role: "user",
              content: `शीर्षक: ${description}\n\nसामग्री: ${imageDescription || ''}\n\nयस समाचारको SEO विश्लेषण JSON मा दिनुहोस्।`
            }
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!seoResponse.ok) {
        const errorText = await seoResponse.text();
        console.error("SEO AI error:", seoResponse.status, errorText);
        throw new Error("SEO सुझाव तयार गर्न सकिएन");
      }

      const seoData = await seoResponse.json();
      const seoContent = seoData.choices?.[0]?.message?.content;
      const seoSuggestions = JSON.parse(seoContent);

      return new Response(JSON.stringify(seoSuggestions), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle headline suggestions
    if (action === "suggest_headlines") {
      console.log("Generating headline suggestions...");
      const headlineResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              content: `तिमी एक अनुभवी नेपाली समाचार सम्पादक हौ। दिइएको समाचार सामग्रीको आधारमा ५ वटा फरक शीर्षक विकल्पहरू सुझाव गर।
              
प्रत्येक शीर्षक:
- आकर्षक र ध्यानाकर्षक हुनुपर्छ
- तथ्यमा आधारित हुनुपर्छ
- फरक शैलीमा हुनुपर्छ (एउटा प्रश्नात्मक, एउटा सीधा, एउटा भावनात्मक आदि)

JSON फर्म्याटमा उत्तर दिनुपर्छ:
{
  "headlines": [
    {"text": "शीर्षक १", "style": "प्रश्नात्मक"},
    {"text": "शीर्षक २", "style": "सीधा"},
    {"text": "शीर्षक ३", "style": "भावनात्मक"},
    {"text": "शीर्षक ४", "style": "संक्षिप्त"},
    {"text": "शीर्षक ५", "style": "विस्तृत"}
  ]
}`
            },
            {
              role: "user",
              content: `समाचार सामग्री:\n${description}\n\nयस समाचारका लागि ५ वटा फरक शीर्षक विकल्पहरू JSON मा दिनुहोस्।`
            }
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!headlineResponse.ok) {
        const errorText = await headlineResponse.text();
        console.error("Headline AI error:", headlineResponse.status, errorText);
        throw new Error("शीर्षक सुझाव गर्न सकिएन");
      }

      const headlineData = await headlineResponse.json();
      const headlineContent = headlineData.choices?.[0]?.message?.content;
      const headlines = JSON.parse(headlineContent);

      return new Response(JSON.stringify(headlines), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle image analysis
    if (action === "analyze_image" && imageBase64) {
      console.log("Analyzing image with AI...");
      const imageAnalysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `तिमी एक समाचार फोटो विश्लेषक हौ। फोटो हेरेर समाचारका लागि उपयोगी विवरण दिनुपर्छ।

JSON फर्म्याटमा उत्तर दिनुपर्छ:
{
  "description": "फोटोमा के देखिन्छ (ठाउँ, व्यक्तिहरू, घटना, वस्तुहरू)",
  "location": "अनुमानित ठाउँ (यदि पहिचान गर्न सकिन्छ भने)",
  "event_type": "घटनाको प्रकार (दुर्घटना, उद्घाटन, प्रदर्शन, आदि)",
  "notable_elements": ["मुख्य तत्व १", "मुख्य तत्व २"],
  "mood": "फोटोको भाव (गम्भीर, खुसी, तनावपूर्ण आदि)",
  "news_angle": "सम्भावित समाचार कोण"
}`
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "यो फोटो विश्लेषण गरेर समाचारका लागि विवरण JSON मा दिनुहोस्।"
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageBase64
                  }
                }
              ]
            }
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!imageAnalysisResponse.ok) {
        const errorText = await imageAnalysisResponse.text();
        console.error("Image analysis error:", imageAnalysisResponse.status, errorText);
        throw new Error("फोटो विश्लेषण गर्न सकिएन");
      }

      const imageData = await imageAnalysisResponse.json();
      const analysisContent = imageData.choices?.[0]?.message?.content;
      const analysis = JSON.parse(analysisContent);

      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Regular news generation
    let systemPrompt = "";
    let userPrompt = "";
    let combinedImageDescription = imageDescription || "";

    if (generateType === "full") {
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
${combinedImageDescription ? `फोटो/भिडियोको विवरण: ${combinedImageDescription}` : ''}
${description ? `कच्चा विवरण/नोट: ${description}` : ''}

माथिको जानकारीबाट पूर्ण समाचार JSON फर्म्याटमा तयार गर।`;

    } else if (generateType === "breaking") {
      systemPrompt = `तिमी नेपाली ब्रेकिङ न्यूज लेखक हौ। ५०-८० शब्दको छोटो ब्रेकिङ न्यूज तयार गर।
JSON फर्म्याटमा उत्तर दिनुपर्छ:
{
  "title": "ब्रेकिङ शीर्षक",
  "excerpt": "छोटो विवरण",
  "content": "ब्रेकिङ न्यूज सामग्री"
}`;

      userPrompt = `${description || ''} ${combinedImageDescription || ''}
माथिको जानकारीबाट ब्रेकिङ न्यूज JSON मा तयार गर।`;

    } else if (generateType === "script") {
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

      userPrompt = `${description || ''} ${combinedImageDescription || ''}
माथिको जानकारीबाट भिडियो स्क्रिप्ट JSON मा तयार गर।`;
    }

    console.log("Generating news with type:", generateType);
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
