// The how-tos on Account → Help. Plain steps a musician can follow; button names match the site.
export const HOW_TOS: { title: string; steps: string[]; note?: string }[] = [
  { title: "Add a recording to a tune", steps: [
    "Open the setlist and tap the tune.",
    "Tap Recordings (on a computer it's already on the right).",
    "Tap Upload, then Upload a recording or Record.",
  ], note: "MP3, WAV or M4A, up to 25 MB. Apple Lossless files get a playable copy automatically." },
  { title: "Add a note, with or without audio", steps: [
    "Open the tune and go to Notes.",
    "Tap Add note.",
    "Type something, or tap Upload file or Record audio.",
    "Tap the button to save it. Nothing is saved until you do.",
  ] },
  { title: "Add a chart", steps: ["Open the tune.", "Tap Upload chart and choose a PDF or photo."] },
  { title: "Make a setlist", steps: ["Go to Setlists and tap New setlist.", "Give it a name, then tap Add tunes."] },
  { title: "Share a setlist", steps: ["Open the setlist.", "Choose who can see it, then send them the link."] },
  { title: "Make a gig", steps: ["Go to Gigs and tap New gig.", "Fill in the details, then add a setlist and the lineup."] },
  { title: "Make a band", steps: ["Go to Bands and tap New band.", "Tap Invite and send the link to your bandmates."] },
  { title: "Hear about changes", steps: ["Open a gig or band.", "Tick Tell me about updates. The bell tells you when something changes."] },
];
