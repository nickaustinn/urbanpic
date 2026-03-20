export type IssueType =
  | "POTHOLE"
  | "GRAFFITI"
  | "BROKEN_STREETLIGHT"
  | "ILLEGAL_DUMPING"
  | "ABANDONED_VEHICLE"
  | "DAMAGED_SIDEWALK"
  | "FLOODING"
  | "OTHER";

export type Severity = "LOW" | "MEDIUM" | "HIGH";

export type ReportStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";
