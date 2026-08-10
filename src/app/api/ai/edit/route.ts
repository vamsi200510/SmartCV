import { NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/ai/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, currentResumeData, selectedTemplate, chatHistory, userProfile } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const ai = getGeminiClient();

    const systemPrompt = `
You are the SmartCV AI Career Assistant operating in FULL EDIT MODE for a resume builder application.
Your role is to analyze user instructions and directly modify any part of the resume — content, structure, and design.

You MUST generate the modified fields inside the "changes" object as a PARTIAL PATCH (only include fields that actually change).

═══════════════════════════════════════════════════════════════
FULL RESUME SCHEMA — ALL EDITABLE FIELDS
═══════════════════════════════════════════════════════════════

1. personalInfo (object) — identity fields
   fullName, title, email, phone, location, website, github, linkedin, summary (string)

2. experience (array) — each item:
   { id, company, role, location, startDate, endDate, current (bool), bullets: string[] }
   - To add a job: append a new object
   - To edit: return the full updated array
   - bullets is an array of achievement strings (use strong action verbs + metrics)

3. education (array) — each item:
   { id, institution, degree, field, startDate, endDate, gpa, courses: string[] }

4. projects (array) — each item:
   { id, name, description, techStack: string[], url, github, bullets: string[] }

5. skills (array) — each item:
   { id, category, items: string[] }
   - "category" is the group label (e.g. "Languages", "Frameworks", "Tools")
   - "items" is the list of skills in that category
   - To add "Go" to Languages: find the Languages category and append "Go" to its items array
   - To add a new category: append a new { id, category, items } object

6. certifications (array) — each item:
   { id, name, issuer, date, url }

7. achievements (array) — each item:
   { id, title, description }

8. additionalInfo (object):
   { languages: string[], interests: string[], volunteering: string[] }

9. customization (object) — design settings:
   fontFamily, fontSize, density, primaryColor
   sectionOrder: string[]    (ordered list of section ids)
   visibleSections: string[] (which sections to show)
   sectionTypography: Record<sectionId, { fontSize?, fontWeight?, color?, lineHeight?, letterSpacing? }>
     - Valid sectionIds: summary, experience, projects, skills, education, certifications, achievements, additionalInfo
     - Valid fontSize values: small, medium, large, extraLarge
     - Valid fontWeight values: normal, medium, semibold, bold

═══════════════════════════════════════════════════════════════
BEHAVIOR RULES
═══════════════════════════════════════════════════════════════

CONTENT EDITING:
- When asked to add/remove/edit skills, experience, education, projects, or any section — DO IT directly.
- "Add Go to Languages" => find the skills array, find the category with name "Languages", add "Go" to its items.
- "Rewrite summary" => generate an engaging 2-3 sentence summary and set personalInfo.summary.
- "Add a new project" => append to the projects array with realistic placeholder data if not specified.
- "Change my job title" => update personalInfo.title.
- Always return the COMPLETE updated array for array fields (experience, skills, education, etc.) so the client can replace them.

DESIGN EDITING:
- "Change primary color to blue" => customization.primaryColor = "#2563EB"
- "Make Skills section bold" => customization.sectionTypography.skills.fontWeight = "bold"
- "Use Poppins font" => customization.fontFamily = "Poppins"
- "Compact layout" => customization.density = "compact"

SCOPE:
- Modify ONLY what the user asked for. Do not touch unrelated sections.
- Return ONLY changed fields (partial patch). Never return the full resume object.
- If ambiguous, ask a clarifying question in "explanation" and return empty changes: {}.

Always include an informative "explanation" string describing what you changed, and 2-3 relevant "suggestedPrompts".
`;

    const userMessageContent = `
USER PROMPT:
${prompt}

CURRENT RESUME DATA:
${JSON.stringify(currentResumeData || {}, null, 2)}

USER PROFILE:
${JSON.stringify(userProfile || {}, null, 2)}

ACTIVE TEMPLATE:
${JSON.stringify(selectedTemplate || {}, null, 2)}

CHAT HISTORY:
${JSON.stringify(chatHistory || [], null, 2)}
`;

    const sectionTypographySchema = () => ({
      type: "OBJECT",
      properties: {
        fontSize: { type: "STRING" },
        fontWeight: { type: "STRING" },
        color: { type: "STRING" },
        lineHeight: { type: "STRING" },
        letterSpacing: { type: "STRING" }
      }
    });

    const experienceItemSchema = {
      type: "OBJECT",
      properties: {
        id: { type: "STRING" },
        company: { type: "STRING" },
        role: { type: "STRING" },
        location: { type: "STRING" },
        startDate: { type: "STRING" },
        endDate: { type: "STRING" },
        current: { type: "BOOLEAN" },
        bullets: { type: "ARRAY", items: { type: "STRING" } }
      }
    };

    const educationItemSchema = {
      type: "OBJECT",
      properties: {
        id: { type: "STRING" },
        institution: { type: "STRING" },
        degree: { type: "STRING" },
        field: { type: "STRING" },
        startDate: { type: "STRING" },
        endDate: { type: "STRING" },
        gpa: { type: "STRING" },
        courses: { type: "ARRAY", items: { type: "STRING" } }
      }
    };

    const projectItemSchema = {
      type: "OBJECT",
      properties: {
        id: { type: "STRING" },
        name: { type: "STRING" },
        description: { type: "STRING" },
        techStack: { type: "ARRAY", items: { type: "STRING" } },
        url: { type: "STRING" },
        github: { type: "STRING" },
        bullets: { type: "ARRAY", items: { type: "STRING" } }
      }
    };

    const skillItemSchema = {
      type: "OBJECT",
      properties: {
        id: { type: "STRING" },
        category: { type: "STRING" },
        items: { type: "ARRAY", items: { type: "STRING" } }
      }
    };

    const certificationItemSchema = {
      type: "OBJECT",
      properties: {
        id: { type: "STRING" },
        name: { type: "STRING" },
        issuer: { type: "STRING" },
        date: { type: "STRING" },
        url: { type: "STRING" }
      }
    };

    const achievementItemSchema = {
      type: "OBJECT",
      properties: {
        id: { type: "STRING" },
        title: { type: "STRING" },
        description: { type: "STRING" }
      }
    };

    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash"];
    let responseText: string | null = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: userMessageContent,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  explanation: { type: "STRING" },
                  changes: {
                    type: "OBJECT",
                    properties: {
                      // Personal Info
                      personalInfo: {
                        type: "OBJECT",
                        properties: {
                          fullName: { type: "STRING" },
                          title: { type: "STRING" },
                          email: { type: "STRING" },
                          phone: { type: "STRING" },
                          location: { type: "STRING" },
                          website: { type: "STRING" },
                          github: { type: "STRING" },
                          linkedin: { type: "STRING" },
                          summary: { type: "STRING" }
                        }
                      },
                      // Content sections — full array replacements
                      experience: { type: "ARRAY", items: experienceItemSchema },
                      education: { type: "ARRAY", items: educationItemSchema },
                      projects: { type: "ARRAY", items: projectItemSchema },
                      skills: { type: "ARRAY", items: skillItemSchema },
                      certifications: { type: "ARRAY", items: certificationItemSchema },
                      achievements: { type: "ARRAY", items: achievementItemSchema },
                      additionalInfo: {
                        type: "OBJECT",
                        properties: {
                          languages: { type: "ARRAY", items: { type: "STRING" } },
                          interests: { type: "ARRAY", items: { type: "STRING" } },
                          volunteering: { type: "ARRAY", items: { type: "STRING" } }
                        }
                      },
                      // Design / customization
                      customization: {
                        type: "OBJECT",
                        properties: {
                          fontFamily: { type: "STRING" },
                          fontSize: { type: "STRING" },
                          density: { type: "STRING" },
                          primaryColor: { type: "STRING" },
                          sectionOrder: { type: "ARRAY", items: { type: "STRING" } },
                          visibleSections: { type: "ARRAY", items: { type: "STRING" } },
                          sectionTypography: {
                            type: "OBJECT",
                            properties: {
                              summary: sectionTypographySchema(),
                              experience: sectionTypographySchema(),
                              projects: sectionTypographySchema(),
                              skills: sectionTypographySchema(),
                              education: sectionTypographySchema(),
                              certifications: sectionTypographySchema(),
                              achievements: sectionTypographySchema(),
                              additionalInfo: sectionTypographySchema()
                            }
                          }
                        }
                      }
                    }
                  },
                  suggestedPrompts: { type: "ARRAY", items: { type: "STRING" } }
                },
                required: ["explanation", "changes", "suggestedPrompts"]
              }
            }
          });
          if (response.text) {
            responseText = response.text;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`[AI Route Warning] Model ${modelName} attempt ${attempt} failed: ${err.message}`);
          if (attempt < 3) await new Promise(r => setTimeout(r, 15000));
        }
      }
      if (responseText) break;
    }

    if (!responseText) {
      throw lastError || new Error("Empty response received from Gemini API");
    }

    const result = JSON.parse(responseText);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Error in edit-resume AI route:", err);
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}
