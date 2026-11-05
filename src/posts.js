export const posts = [
  { id: 1, author: 'maya_t', hoursAgo: 2, howls: 24, text: 'Free pizza outside the Brickyard for anyone who stops by the robotics club table. Go before it is gone!' },
  { id: 2, author: 'jordan.k', hoursAgo: 3, howls: 9, text: 'Floor 4 of Hunt is dead silent right now. Perfect for studying for the CSC 216 exam.' },
  { id: 3, author: 'priya_s', hoursAgo: 5, howls: 31, text: 'The Talley line at Port City Java is out the door again. Worth it for the iced latte, honestly.' },
  { id: 4, author: 'wolfpack_will', hoursAgo: 24, howls: 57, text: 'GAME DAY. Tailgate lot opens at 8am and I am already in a red jacket. Let\'s go Pack!' },
  { id: 5, author: 'emily.r', hoursAgo: 24, howls: 14, text: 'Took the Wolfline to Centennial for the first time and wow, it is a totally different vibe over here.' },
  { id: 6, author: 'devon_b', hoursAgo: 24, howls: 6, text: 'Does anyone know if the Hill Library 24-hour floors are open during finals week? Asking for my sleep schedule.' },
  { id: 7, author: 'sam_the_engineer', hoursAgo: 48, howls: 18, text: 'Lab partner needed for ECE 306. I bring snacks and a working soldering iron.' },
  { id: 8, author: 'aaliyah_m', hoursAgo: 48, howls: 40, text: 'Sunset at Lake Raleigh tonight was unreal. Highly recommend a walk after your last class.' },
  { id: 9, author: 'chris.p', hoursAgo: 48, howls: 22, reports: 2, text: 'Fountain has the good chicken tenders today. Spread the word, tell your friends.' },
  { id: 10, author: 'tori_w', hoursAgo: 72, howls: 3, text: 'Lost: a blue Hydro Flask with a Wolfpack sticker. Last seen near Wolf Plaza. Please message me if you find it!' },
  { id: 11, author: 'nate_g', hoursAgo: 72, howls: 12, text: 'Basketball practice open to students tonight at Reynolds. The energy in there is unmatched.' },
  { id: 12, author: 'hannah_l', hoursAgo: 96, howls: 0, text: 'Tradition check: I finally walked under the Belltower and I am supposed to avoid graduating late now, right?' },
  {
    id: 13,
    author: 'omar_f',
   
    hoursAgo: 96, howls: 5,
    text: 'Okay story time. I went to Hunt at 7pm thinking I would do a quick hour of studying for my stats midterm. Somehow it turned into a four-hour adventure that included discovering the robot book delivery system, getting distracted by the gaming lab, making friends with a group from my physics class who happened to be at the next table, splitting a very large order of food from the Talley food court, and then finally getting maybe thirty minutes of real studying done right before they kicked everyone out at midnight. I would say it was the most productive unproductive night of my semester. If you are ever feeling lonely on campus, just go to Hunt and sit near the big windows. Someone will talk to you eventually. Also the chairs on the second floor are the best on campus, and I will not be taking questions on that.',
  },
  { id: 14, author: 'lucia_v', hoursAgo: 120, howls: 7, text: 'Why is it always either 85 degrees or freezing in Raleigh in October? I am so confused about what to wear.' },
  { id: 15, author: 'ben_o', hoursAgo: 120, howls: 2, text: 'Career fair is tomorrow in Talley. Bring resumes, wear a blazer, and eat something first.' },
]

// Sample comments, by post id. minutesAfter counts from when the post went up.
export const comments = {
  1: [
    { author: 'jordan.k', minutesAfter: 6, text: 'Still pizza left at 1:15? Asking for my whole study group.' },
    { author: 'maya_t', minutesAfter: 9, text: 'Two boxes of pepperoni left. Run.' },
    { author: 'devon_b', minutesAfter: 31, text: 'Got the last slice. Thank you, robotics club.' },
  ],
  2: [
    { author: 'omar_f', minutesAfter: 12, text: 'Floor 4 is the best kept secret on campus. Please stop telling people.' },
    { author: 'hannah_l', minutesAfter: 40, text: 'Good luck on 216! The practice exam is close to the real thing.' },
  ],
  3: [
    { author: 'emily.r', minutesAfter: 15, text: 'Pro tip: order ahead in the app and skip the whole line.' },
    { author: 'priya_s', minutesAfter: 18, text: 'There is an app?? Life changing.' },
  ],
  4: [
    { author: 'nate_g', minutesAfter: 20, text: 'See you in lot 4. We have a grill and too many burgers.' },
    { author: 'tori_w', minutesAfter: 55, text: 'Wear sunscreen, it is going to be 80 degrees by noon.' },
    { author: 'ben_o', minutesAfter: 90, text: 'Section 6 is going to be loud today. Go Pack!' },
  ],
  6: [{ author: 'jordan.k', minutesAfter: 25, text: 'Yes, floors 2 to 4 stay open all night during finals week.' }],
  7: [{ author: 'chris.p', minutesAfter: 45, text: 'What lab section? I am in Tuesday afternoons.' }],
  8: [
    { author: 'lucia_v', minutesAfter: 10, text: 'The colors last night were unreal. Same time tomorrow?' },
    { author: 'aaliyah_m', minutesAfter: 22, text: 'Always. Bring a jacket though.' },
  ],
  10: [{ author: 'sam_the_engineer', minutesAfter: 70, text: 'Saw a blue Hydro Flask at the lost and found in Talley this morning!' }],
  13: [{ author: 'maya_t', minutesAfter: 35, text: 'This is the most Hunt Library story ever written.' }],
}

// Sample campus events. daysFromNow and hour (24-hour clock) set when each one starts.
export const events = [
  { id: 1, title: 'Robotics club open lab', place: 'Engineering Building II', daysFromNow: 1, hour: 18, going: 23, details: 'Drop in, drive a robot and meet the build team. No experience needed, snacks provided.' },
  { id: 2, title: 'Basketball scrimmage, open to students', place: 'Reynolds Coliseum', daysFromNow: 2, hour: 19, going: 141, details: 'Doors open 30 minutes early. Bring your student ID and your loudest voice.' },
  { id: 3, title: 'Resume reviews before the career fair', place: 'Talley Student Union', daysFromNow: 3, hour: 13, going: 58, details: 'Bring a printed resume and get notes from recruiters and career coaches in 10 minutes.' },
  { id: 4, title: 'Sunset walk around the lake', place: 'Lake Raleigh', daysFromNow: 4, hour: 17, going: 36, details: 'A slow loop around the lake. Meet at the boathouse, leave whenever you like.' },
  { id: 5, title: 'Late-night study session with free coffee', place: 'Hunt Library', daysFromNow: 6, hour: 21, going: 87, details: 'Quiet tables, free coffee until midnight and tutors for math and physics.' },
  { id: 6, title: 'Game day tailgate', place: 'Carter-Finley Stadium', daysFromNow: 8, hour: 9, going: 212, details: 'Student lot opens at 9. Wear red, bring water and a friend.' },
]
