import { IssueType } from "@/lib/types";

// Leaf-level SR Type IDs from the NEXGEN 311 API
const SR_TYPE_MAP: Record<IssueType, { id: number; label: string }> = {
  POTHOLE: { id: 234, label: "Potholes" },
  GRAFFITI: { id: 193, label: "Graffiti Removal" },
  BROKEN_STREETLIGHT: { id: 153, label: "Street Lighting Issue" },
  ILLEGAL_DUMPING: { id: 196, label: "Illegally Dumped Items" },
  ABANDONED_VEHICLE: { id: 206, label: "Abandoned Boats / Vehicles" },
  DAMAGED_SIDEWALK: { id: 223, label: "Sidewalk Issues" },
  FLOODING: { id: 264, label: "Roadway Flooding" },
  OTHER: { id: 196, label: "Illegally Dumped Items" }, // fallback
};

export function getSRType(issueType: IssueType) {
  return SR_TYPE_MAP[issueType] ?? SR_TYPE_MAP.OTHER;
}

export interface SJC311Payload {
  srTypeId: number;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  isAnonymous: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface SJC311Response {
  SRId: number;
  SRNumber: string;
  SRStatus: string;
  SRPriority: string;
  Description: string;
}

export async function submitToSJC311(
  payload: SJC311Payload,
  imageBase64?: string | null
): Promise<SJC311Response> {
  const body: Record<string, unknown> = {
    CustomAttributes: [],
    Description: payload.description,
    SRTypeId: payload.srTypeId,
    SRLocationId: null,
    SRAssetLocationId: null,
    LocationDisplayName: null,
    IsAnonymous: payload.isAnonymous,
    HideFromPublic: false,
    CustomerId: 0,
    NotifyEmail: false,
    NotifyText: false,
    IncidentAddress: {
      Address1: payload.address ?? "",
      City: "",
      State: "CA",
      Zip: "",
      Country: "US",
      Latitude: payload.latitude,
      Longitude: payload.longitude,
    },
  };

  if (!payload.isAnonymous && payload.lastName) {
    body.Customer = {
      CustomerId: 0,
      FirstName: payload.firstName ?? "",
      LastName: payload.lastName,
      DisplayName: [payload.firstName, payload.lastName].filter(Boolean).join(" "),
      Email: payload.email ?? "",
      Phone: payload.phone ?? "",
    };
  }

  const formData = new FormData();
  formData.append("payLoad", JSON.stringify(body));

  // Convert base64 image to a file blob if provided
  if (imageBase64) {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mime = mimeMatch?.[1] ?? "image/jpeg";
    const byteString = atob(base64Data);
    const bytes = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      bytes[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    const ext = mime.split("/")[1] ?? "jpg";
    formData.append("files", blob, `photo.${ext}`);
  }

  const res = await fetch("https://sjcdpw.public.311service.com/api/service-requests", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "X-Language": "en",
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`SJC 311 submission failed (${res.status}): ${text}`);
  }

  return res.json();
}
