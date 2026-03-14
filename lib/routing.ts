import { IssueType } from "@prisma/client";

const DEPARTMENT_MAP: Record<IssueType, string> = {
  POTHOLE: "Department of Public Works",
  GRAFFITI: "Parks & Recreation",
  BROKEN_STREETLIGHT: "Department of Transportation",
  ILLEGAL_DUMPING: "Sanitation Department",
  ABANDONED_VEHICLE: "Parking Enforcement",
  DAMAGED_SIDEWALK: "Department of Public Works",
  FLOODING: "Stormwater Management",
  OTHER: "City Services 311",
};

export function getDepartment(issueType: IssueType): string {
  return DEPARTMENT_MAP[issueType] ?? "City Services 311";
}
