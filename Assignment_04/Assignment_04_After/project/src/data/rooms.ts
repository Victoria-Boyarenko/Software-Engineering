import type { RoomConfig } from "@/lib/availability";

export const EQUIPMENT_OPTIONS = [
  "Projector",
  "Whiteboard",
  "Video Conferencing",
  "Lab Computers",
  "Sound System",
] as const;

export const DEFAULT_ROOM: RoomConfig = {
  id: "eng-204",
  name: "Engineering Hall, Room 204",
  building: "Engineering Hall",
  capacity: 40,
  equipment: ["Projector", "Whiteboard"],
  blocked: false,
  bookings: [
    { label: "Data Structures Lecture", start: 600, end: 660 }, // 10:00–11:00
  ],
};

export const ROOMS: RoomConfig[] = [
  DEFAULT_ROOM,
  {
    id: "lib-b2",
    name: "Library Study Pod B2",
    building: "Main Library",
    capacity: 6,
    equipment: ["Whiteboard", "Video Conferencing"],
    blocked: false,
    bookings: [{ label: "Group Study: Thesis Review", start: 780, end: 840 }],
  },
  {
    id: "sci-lab-3",
    name: "Science Centre, Lab 3",
    building: "Science Centre",
    capacity: 24,
    equipment: ["Projector", "Lab Computers"],
    blocked: false,
    bookings: [{ label: "Chemistry Practical", start: 840, end: 960 }],
  },
  {
    id: "su-hall",
    name: "Student Union Hall",
    building: "Student Union",
    capacity: 120,
    equipment: ["Projector", "Video Conferencing", "Sound System"],
    blocked: false,
    bookings: [{ label: "Society Meeting", start: 1020, end: 1080 }],
  },
  {
    id: "arts-s1",
    name: "Arts Block Studio 1",
    building: "Arts Block",
    capacity: 15,
    equipment: ["Whiteboard", "Sound System"],
    blocked: true,
    bookings: [],
  },
];
