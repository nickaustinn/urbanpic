import Anthropic from "@anthropic-ai/sdk";
import { IssueType, Severity } from "@prisma/client";
import { getDepartment } from "./routing";

const client = new Anthropic();

export interface ClassifyResult {
  issueType: IssueType;
  severity: Severity;
  description: string;
  confidence: "low" | "medium" | "high";
  department: string;
}

const VALID_ISSUE_TYPES = new Set<string>([
  "POTHOLE",
  "GRAFFITI",
  "BROKEN_STREETLIGHT",
  "ILLEGAL_DUMPING",
  "ABANDONED_VEHICLE",
  "DAMAGED_SIDEWALK",
  "FLOODING",
  "OTHER",
]);

const VALID_SEVERITIES = new Set<string>(["LOW", "MEDIUM", "HIGH"]);

const PROMPT = `You are a civic issue classifier for a 311 reporting system.

Analyze the provided image and respond with a JSON object containing:
- issueType: one of [POTHOLE, GRAFFITI, BROKEN_STREETLIGHT, ILLEGAL_DUMPING, ABANDONED_VEHICLE, DAMAGED_SIDEWALK, FLOODING, OTHER]
- severity: one of [LOW, MEDIUM, HIGH]
- description: a clear, professional 311 report description (2-3 sentences, max 300 characters) suitable for submission to a city department
- confidence: one of [low, medium, high]

Respond only with valid JSON. Do not include any explanation outside the JSON.`;

export async function classifyImage(imageBase64: string): Promise<ClassifyResult> {
  // Strip the data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const mediaType = imageBase64.startsWith("data:image/png") ? "image/png" : "image/jpeg";

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Data,
            },
          },
          {
            type: "text",
            text: PROMPT,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  // Extract JSON from response (Claude sometimes wraps in markdown code fences)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in Claude response");

  const parsed = JSON.parse(jsonMatch[0]);

  const issueType: IssueType = VALID_ISSUE_TYPES.has(parsed.issueType)
    ? (parsed.issueType as IssueType)
    : "OTHER";

  const severity: Severity = VALID_SEVERITIES.has(parsed.severity?.toUpperCase())
    ? (parsed.severity.toUpperCase() as Severity)
    : "MEDIUM";

  return {
    issueType,
    severity,
    description: parsed.description ?? "Civic issue reported via UrbanPic.",
    confidence: parsed.confidence ?? "medium",
    department: getDepartment(issueType),
  };
}
