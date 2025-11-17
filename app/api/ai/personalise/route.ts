import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Personalization API endpoint
 * Takes a message template with variables and improves it using OpenAI
 * while preserving all template variables ({{variable}} format)
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { template, variables } = body;

    if (!template || typeof template !== "string") {
      return NextResponse.json(
        { error: "Template is required and must be a string" },
        { status: 400 }
      );
    }

    // Extract all template variables from the original template
    const variableMatches = template.match(/\{\{(\w+)\}\}/g) || [];
    const variableNames = variableMatches.map((match) =>
      match.replace(/\{\{|\}\}/g, "")
    );

    // Create a prompt that instructs OpenAI to improve the message while preserving variables
    const systemPrompt = `You are a helpful assistant that improves customer service messages for a beauty salon. 
Your task is to make messages more personal, warm, and engaging while preserving ALL template variables in the exact format {{variable_name}}.

Important rules:
1. Keep ALL template variables exactly as they appear: {{name}}, {{service_type}}, {{stylist}}, {{days}}, etc.
2. Do NOT replace or remove any template variables
3. Make the message more personal, friendly, and professional
4. Keep the same general structure and meaning
5. Use appropriate emojis sparingly
6. Make it sound natural and conversational`;

    const userPrompt = `Improve this message template while keeping all variables intact:

${template}

Variables to preserve: ${variableNames.join(", ")}

Return only the improved message with all variables preserved in {{variable_name}} format.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const improvedMessage =
      completion.choices[0]?.message?.content?.trim() || "";

    if (!improvedMessage) {
      return NextResponse.json(
        { error: "Failed to generate improved message" },
        { status: 500 }
      );
    }

    // Verify that all original variables are still present
    const missingVariables: string[] = [];
    for (const varName of variableNames) {
      const regex = new RegExp(`\\{\\{${varName}\\}\\}`, "g");
      if (!regex.test(improvedMessage)) {
        missingVariables.push(varName);
      }
    }

    if (missingVariables.length > 0) {
      console.warn(
        `Warning: Some variables were removed: ${missingVariables.join(", ")}`
      );
      // If critical variables are missing, return original template as fallback
      // This ensures we don't lose important client information
      return NextResponse.json(
        {
          success: false,
          error: `AI response removed required variables: ${missingVariables.join(", ")}`,
          improvedMessage: template, // Return original as fallback
          preservedVariables: variableNames.filter(
            (v) => !missingVariables.includes(v)
          ),
          missingVariables,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        improvedMessage,
        preservedVariables: variableNames.filter(
          (v) => !missingVariables.includes(v)
        ),
        missingVariables: missingVariables.length > 0 ? missingVariables : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AI Personalise] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

