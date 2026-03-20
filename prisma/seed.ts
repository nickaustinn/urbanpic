import { PrismaClient } from "@prisma/client";

type IssueType = "POTHOLE" | "GRAFFITI" | "BROKEN_STREETLIGHT" | "ILLEGAL_DUMPING" | "ABANDONED_VEHICLE" | "DAMAGED_SIDEWALK" | "FLOODING" | "OTHER";
type Severity = "LOW" | "MEDIUM" | "HIGH";
type ReportStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";

const prisma = new PrismaClient();

// San Francisco bounding box
const SF_BOUNDS = { minLat: 37.70, maxLat: 37.83, minLon: -122.52, maxLon: -122.35 };

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const ISSUE_TYPES: IssueType[] = [
  "POTHOLE", "GRAFFITI", "BROKEN_STREETLIGHT", "ILLEGAL_DUMPING",
  "ABANDONED_VEHICLE", "DAMAGED_SIDEWALK", "FLOODING", "OTHER",
];

const SEVERITIES: Severity[] = ["LOW", "MEDIUM", "HIGH"];
const STATUSES: ReportStatus[] = ["PENDING", "IN_PROGRESS", "RESOLVED"];

const DESCRIPTIONS: Record<IssueType, string[]> = {
  POTHOLE: [
    "Large pothole approximately 18 inches in diameter causing vehicle damage on the roadway.",
    "Deep pothole near the curb creating a hazard for cyclists and pedestrians.",
    "Multiple potholes in rapid succession along this stretch of road.",
  ],
  GRAFFITI: [
    "Spray-painted graffiti tags covering approximately 10 square feet of the wall.",
    "Offensive graffiti on public utility box visible from the sidewalk.",
    "Graffiti vandalism on storefront shutters blocking pedestrian path.",
  ],
  BROKEN_STREETLIGHT: [
    "Streetlight has been out for several days creating a safety hazard at night.",
    "Flickering streetlight at the intersection causing visibility issues.",
    "Street lamp completely non-functional, leaving a block-long stretch dark.",
  ],
  ILLEGAL_DUMPING: [
    "Large pile of household furniture and electronics illegally dumped on the sidewalk.",
    "Construction debris dumped in alleyway blocking vehicle access.",
    "Multiple bags of trash left beside a dumpster instead of inside it.",
  ],
  ABANDONED_VEHICLE: [
    "Vehicle with expired registration has been parked unmoved for over 72 hours.",
    "Car with flat tires and broken windows abandoned on a residential street.",
    "Motorcycle abandoned without plates blocking a designated loading zone.",
  ],
  DAMAGED_SIDEWALK: [
    "Severely cracked and uplifted sidewalk panel creating a trip hazard.",
    "Sidewalk subsidence of approximately 3 inches near tree root damage.",
    "Broken sidewalk blocking wheelchair accessibility at this intersection.",
  ],
  FLOODING: [
    "Standing water several inches deep on the roadway after last night's rain.",
    "Blocked storm drain causing flooding that is backing up onto the sidewalk.",
    "Intersection flooding from overflowing catch basin affecting traffic flow.",
  ],
  OTHER: [
    "Civic issue reported via UrbanPic requiring attention from city services.",
    "General maintenance issue observed on city property.",
    "Public infrastructure concern requiring inspection.",
  ],
};

const DEPARTMENTS: Record<IssueType, string> = {
  POTHOLE: "Department of Public Works",
  GRAFFITI: "Parks & Recreation",
  BROKEN_STREETLIGHT: "Department of Transportation",
  ILLEGAL_DUMPING: "Sanitation Department",
  ABANDONED_VEHICLE: "Parking Enforcement",
  DAMAGED_SIDEWALK: "Department of Public Works",
  FLOODING: "Stormwater Management",
  OTHER: "City Services 311",
};

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing seed data
  await prisma.report.deleteMany();

  const reports = Array.from({ length: 50 }, () => {
    const issueType = randItem(ISSUE_TYPES);
    return {
      imageUrl: "/uploads/placeholder.jpg",
      issueType,
      severity: randItem(SEVERITIES),
      description: randItem(DESCRIPTIONS[issueType]),
      department: DEPARTMENTS[issueType],
      latitude: rand(SF_BOUNDS.minLat, SF_BOUNDS.maxLat),
      longitude: rand(SF_BOUNDS.minLon, SF_BOUNDS.maxLon),
      address: null,
      status: randItem(STATUSES),
    };
  });

  await prisma.report.createMany({ data: reports });
  console.log(`✅ Seeded ${reports.length} reports`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
