import { players, seasons } from './data.js';

const iplFinal2025 = 'https://www.iplt20.com/news/article/tata-ipl-2025-final-rcb-vs-pbks-match-report';
const iplFinal2026 = 'https://www.iplt20.com/news/article/tata-ipl-2026-final-rcb-v-gt-match-report';
const wplFinal2024 = 'https://www.wplt20.com/news/article/match-report-tata-wpl-2024-final';
const wplFinal2026 = 'https://www.wplt20.com/news/article/match-report-tata-wpl-2026-final';
const clubHistory = 'https://en.wikipedia.org/wiki/Royal_Challengers_Bengaluru';
const iplBatting = 'https://www.cricbuzz.com/cricket-series/9237/indian-premier-league-2025/stats';
const iplBowling = `${iplBatting}?statsType=mostWickets`;
const wplBatting = 'https://www.cricbuzz.com/cricket-series/7518/womens-premier-league-2024/stats';
const wplBowling = `${wplBatting}?statsType=mostWickets`;
const iplScorers = 'https://www.indiatvnews.com/photos/sports-top-5-run-scorers-of-royal-challengers-bengaluru-in-ipl-2025-2025-06-05-993401';

export const competitions = {
  ipl: {
    label: 'INDIAN PREMIER LEAGUE · MEN · SINCE 2008',
    title: 'From the first season to back-to-back titles.',
    description: 'RCB has been part of the IPL since its inaugural season in 2008. The team reached finals in 2009, 2011, and 2016 before winning its first title in 2025. The official 2026 final report records a second crown, with a five-wicket victory over Gujarat Titans.',
    source: iplFinal2026,
    seasonSource: clubHistory,
    highlights: [{ value: '2025 + 2026', label: 'IPL title seasons · verified through 2026' }, { value: '2008', label: 'Inaugural IPL season' }],
    seasons: [...seasons, { year: 2026, finish: 'Champions', stage: 'Won the final vs Gujarat Titans by 5 wickets' }]
  },
  wpl: {
    label: "WOMEN'S PREMIER LEAGUE · WOMEN · SINCE 2023",
    title: 'The women who made winning a habit.',
    description: 'A separate women’s squad under the same RCB franchise entered the WPL in 2023. Smriti Mandhana captained the 2024 champions, who beat Delhi Capitals by eight wickets. The official 2026 report records another title, with a six-wicket win against Delhi Capitals.',
    source: wplFinal2026,
    seasonSource: 'https://en.wikipedia.org/wiki/Royal_Challengers_Bengaluru_(WPL)',
    highlights: [{ value: '2024 + 2026', label: 'WPL title seasons · verified through 2026' }, { value: '2023', label: 'Women’s team debut' }],
    seasons: [
      { year: 2023, finish: '4th', stage: 'League stage · 2 wins, 6 losses · 4 points', source: 'https://www.cricbuzz.com/cricket-series/5938/womens-premier-league-2023/points-table' },
      { year: 2024, finish: 'Champions', stage: 'Won the final vs Delhi Capitals by 8 wickets' },
      { year: 2025, finish: '4th', stage: 'League stage · 3 wins, 5 losses · 6 points', source: 'https://www.cricbuzz.com/cricket-series/9351/womens-premier-league-2025/points-table' },
      { year: 2026, finish: 'Champions', stage: 'Won the final vs Delhi Capitals by 6 wickets' }
    ]
  },
  clt20: {
    label: 'CHAMPIONS LEAGUE TWENTY20 · MEN · DISCONTINUED',
    title: 'Bengaluru on the international club stage.',
    description: 'RCB competed in Champions League Twenty20 in 2009, 2010, and 2011, reaching the 2011 final against Mumbai Indians. CLT20 was an international competition for qualifying domestic T20 clubs, not another name for the IPL. No additional league participation by RCB itself was verified.',
    source: 'https://en.wikipedia.org/wiki/2011_Royal_Challengers_Bangalore_season',
    seasonSource: clubHistory,
    highlights: [{ value: '2009 / 10 / 11', label: 'Verified RCB appearances' }, { value: '2011', label: 'Runners-up · best finish' }],
    seasons: [
      { year: 2009, finish: 'League stage', stage: 'Second group phase · Did not reach the semi-finals', source: 'https://en.wikipedia.org/wiki/2009_Royal_Challengers_Bangalore_season#Champions_League_Twenty20' },
      { year: 2010, finish: 'Semi-finalists', stage: 'Eliminated by Chennai Super Kings' },
      { year: 2011, finish: 'Runners-up', stage: 'Lost the final to Mumbai Indians' }
    ]
  }
};

export const metrics = { matches: 'Matches', runs: 'Runs', wickets: 'Wickets', strikeRate: 'Batting SR' };

export const matchSpotlights = [
  {
    id: 'ipl-2026-final', label: 'IPL 2026 · FINAL', date: '31 MAY 2026 · AHMEDABAD',
    title: 'The crown. Defended.',
    description: 'Kohli’s unbeaten 75 guided RCB to a second consecutive IPL championship.',
    rcbScore: '161/5', opponent: 'GT', opponentScore: '155/8', overs: ['18 overs', '20 overs'],
    result: 'RCB won by 5 wickets', source: iplFinal2026, photo: 'stadium',
    photoAlt: 'An original-resolution archival view of M. Chinnaswamy Stadium',
    photoContext: 'Illustrative home-ground photograph, not the Ahmedabad final venue or the 2026 match.'
  },
  {
    id: 'wpl-2026-final', label: 'WPL 2026 · FINAL', date: '5 FEBRUARY 2026 · VADODARA',
    title: 'A record chase. Another crown.',
    description: 'Mandhana’s 87 and Georgia Voll’s 79 set up a six-wicket win and RCB’s second WPL title.',
    rcbScore: '204/4', opponent: 'DC', opponentScore: '203/4', overs: ['19.4 overs', '20 overs'],
    result: 'RCB won by 6 wickets', source: wplFinal2026, photo: 'stadium',
    photoAlt: 'An original-resolution archival view of RCB’s home stadium',
    photoContext: 'Illustrative home-ground image, not the Vadodara final venue or a photograph of the 2026 women’s squad.'
  },
  {
    id: 'ipl-final', label: 'IPL 2025 · FINAL', date: '03 JUNE 2025 · AHMEDABAD',
    title: 'A dream eighteen seasons in the making.',
    description: 'The first IPL crown. The last over. The six runs that meant everything.',
    rcbScore: '190/9', opponent: 'PBKS', opponentScore: '184/7', overs: ['20 overs', '20 overs'],
    result: 'RCB won by 6 runs', source: iplFinal2025, photo: 'stadium',
    photoAlt: 'An archival high-resolution view of RCB’s home ground',
    photoContext: 'Illustrative RCB home-ground photograph, not the venue or a photograph of the 2025 final.'
  },
  {
    id: 'wpl-final', label: 'WPL 2024 · FINAL', date: '17 MARCH 2024 · NEW DELHI',
    title: 'The women who showed the way.',
    description: 'A fearless spin attack. A composed chase. A first WPL crown for Bengaluru.',
    rcbScore: '115/2', opponent: 'DC', opponentScore: '113', overs: ['19.3 overs', '18.3 overs'],
    result: 'RCB won by 8 wickets', source: wplFinal2024, photo: 'stadium',
    photoAlt: 'An archival view of M. Chinnaswamy Stadium, RCB’s home ground',
    photoContext: 'Illustrative home-stadium image, not the final venue or a photo of the women’s squad.'
  },
  {
    id: 'hyderabad', label: 'IPL 2024 · MATCH 41', date: '25 APRIL 2024 · HYDERABAD',
    title: 'A bold statement. Away from home.',
    description: 'After 6 straight losses, Rajat Patidar (50 off 20), Virat Kohli (51), and Cameron Green (37* off 20) powered RCB to 206/7 before Karn Sharma and Swapnil Singh restricted SRH to 171/8 to ignite the 6-match miracle streak.',
    rcbScore: '206/7', opponent: 'SRH', opponentScore: '171/8', overs: ['20 overs', '20 overs'],
    result: 'RCB won by 35 runs', source: 'https://www.iplt20.com/news/article/tata-ipl-2024-match-41-srh-vs-rcb-match-report', photo: 'green',
    photoAlt: 'Solo portrait of Cameron Green in RCB kit cropped from the post-match award presentation',
    photoContext: 'Solo portrait cropped from the featured match’s award presentation. Rajat Patidar was Player of the Match.'
  }
];

export const comebackStreak = [
  {
    step: '01',
    id: 'srh-apr-25',
    date: '25 APRIL 2024',
    venue: 'Hyderabad',
    opponent: 'SRH',
    opponentFull: 'Sunrisers Hyderabad',
    result: 'Beat Sunrisers Hyderabad by 35 runs',
    rcbScore: '206/7 (20 ov)',
    oppScore: '171/8 (20 ov)',
    potm: 'Rajat Patidar · 50 (20)',
    keyPerformers: 'Rajat Patidar 50 (20) · Virat Kohli 51 · Cameron Green 37* (20) · Karn Sharma & Swapnil Singh',
    summary: 'After a demoralizing 6-match losing streak that left RCB at the bottom of the table with 1 win from 8 games, RCB finally found their footing. Rajat Patidar (50 off 20) and Virat Kohli (51) powered RCB to 206/7, and the spin duo of Karn Sharma and Swapnil Singh derailed SRH’s ultra-aggressive batting lineup, restricting them to 171/8.',
    source: 'https://www.iplt20.com/news/article/tata-ipl-2024-match-41-srh-vs-rcb-match-report'
  },
  {
    step: '02',
    id: 'gt-apr-28',
    date: '28 APRIL 2024',
    venue: 'Ahmedabad',
    opponent: 'GT',
    opponentFull: 'Gujarat Titans',
    result: 'Beat Gujarat Titans by 9 wickets',
    rcbScore: '206/1 (16 ov)',
    oppScore: '200/3 (20 ov)',
    potm: 'Will Jacks · 100* (41)',
    keyPerformers: 'Will Jacks 100* (41) · Virat Kohli 70* (44) · 29-run over vs Rashid Khan',
    summary: 'Chasing GT’s formidable 200/3, Will Jacks unleashed absolute carnage. He smashed an unbeaten 100 off just 41 balls—taking Rashid Khan apart in a 29-run over—while Kohli anchored with an unbeaten 70. RCB chased the target down in just 16 overs, significantly boosting their Net Run Rate.',
    source: 'https://www.iplt20.com/'
  },
  {
    step: '03',
    id: 'gt-may-04',
    date: '04 MAY 2024',
    venue: 'Bengaluru',
    opponent: 'GT',
    opponentFull: 'Gujarat Titans',
    result: 'Beat Gujarat Titans by 4 wickets',
    rcbScore: '152/6 (13.4 ov)',
    oppScore: '147 (19.3 ov)',
    potm: 'Mohammed Siraj · 2/29',
    keyPerformers: 'Mohammed Siraj (Player of the Match) · Faf du Plessis 64 (23) · Virat Kohli 42 (27)',
    summary: 'Mohammed Siraj (Player of the Match) and the bowling unit bundled out GT for just 147 at Chinnaswamy. Despite a sudden middle-order collapse in the chase, RCB tracked the target down in just 13.4 overs (152/6), continuing their momentum and further repairing their NRR.',
    source: 'https://www.iplt20.com/'
  },
  {
    step: '04',
    id: 'pbks-may-09',
    date: '09 MAY 2024',
    venue: 'Dharamshala',
    opponent: 'PBKS',
    opponentFull: 'Punjab Kings',
    result: 'Beat Punjab Kings by 60 runs',
    rcbScore: '241/7 (20 ov)',
    oppScore: '181 (17 ov)',
    potm: 'Virat Kohli · 92 (47)',
    keyPerformers: 'Virat Kohli 92 (47 · POTM) · Rajat Patidar 55 (23) · Cameron Green 46 (27)',
    summary: 'Virat Kohli (Player of the Match) dominated the innings with 92 off 47 balls to help RCB post a massive 241/7 in Dharamshala. The bowlers then dismissed PBKS for 181, securing a massive 60-run victory that kept their mathematical playoff hopes alive.',
    source: 'https://www.iplt20.com/'
  },
  {
    step: '05',
    id: 'dc-may-12',
    date: '12 MAY 2024',
    venue: 'Bengaluru',
    opponent: 'DC',
    opponentFull: 'Delhi Capitals',
    result: 'Beat Delhi Capitals by 47 runs',
    rcbScore: '187/9 (20 ov)',
    oppScore: '140 (19.1 ov)',
    potm: 'Cameron Green · 32* & 1/19',
    keyPerformers: 'Cameron Green (Player of the Match) · Rajat Patidar 52 (32) · Will Jacks 41 (29)',
    summary: 'In a crucial must-win game at Bengaluru, Cameron Green (Player of the Match) and the RCB batting lineup posted 187/9 on a tricky pitch. Disciplined bowling dismantled the DC chase for 140, setting up a winner-takes-all final league match.',
    source: 'https://www.iplt20.com/'
  },
  {
    step: '06',
    id: 'csk-may-18',
    date: '18 MAY 2024 · THE KNOCKOUT',
    venue: 'Bengaluru',
    opponent: 'CSK',
    opponentFull: 'Chennai Super Kings',
    result: 'Beat Chennai Super Kings by 27 runs',
    rcbScore: '218/5 (20 ov)',
    oppScore: '191/7 (20 ov)',
    potm: 'Faf du Plessis · 54 (39)',
    keyPerformers: 'Faf du Plessis 54 · Virat Kohli 47 · Rajat Patidar 41 · Yash Dayal final-over defence',
    summary: 'In a virtual quarter-final, RCB needed to win by at least 18 runs to surpass CSK’s NRR and steal the final playoff spot. Faf du Plessis (54), Kohli (47), and Patidar (41) pushed RCB to a commanding 218/5. In a dramatic final over where CSK needed 17 runs to qualify, Yash Dayal was hit for a massive six by MS Dhoni on the first ball—then bounced back to dismiss Dhoni on the next delivery and conceded just one more run, restricting CSK to 191/7 and sealing RCB’s miracle playoff berth.',
    source: 'https://www.iplt20.com/videos/s-ipl-2024-m68-rcb-vs-csk-match-highlights-4iyaej'
  }
];

export const snapshots = {
  ipl: {
    label: 'IPL 2025',
    source: iplBatting,
    records: [
      { playerId: 'virat', matches: 15, runs: 657, wickets: null, strikeRate: 144.71, sources: [iplBatting] },
      { playerId: 'rajat', matches: null, runs: 312, wickets: null, strikeRate: null, sources: [iplScorers] },
      { playerId: 'salt', matches: 13, runs: 403, wickets: null, strikeRate: 175.98, sources: [iplScorers, 'https://iplt20stats.com/ipl-2025/royal-challengers-bangalore/player/phil-salt'] },
      { playerId: 'jitesh', matches: null, runs: 261, wickets: null, strikeRate: 176.35, sources: [iplScorers] },
      { playerId: 'krunal', matches: 15, runs: null, wickets: 17, strikeRate: null, sources: [iplBowling] },
      { playerId: 'hazlewood', matches: 12, runs: null, wickets: 22, strikeRate: null, sources: [iplBowling] },
      { playerId: 'bhuvi', matches: 14, runs: null, wickets: 17, strikeRate: null, sources: [iplBowling] }
    ]
  },
  wpl: {
    label: 'WPL 2024',
    source: wplBatting,
    records: [
      { playerId: 'smriti', matches: 10, runs: 300, wickets: null, strikeRate: 133.93, sources: [wplBatting] },
      { playerId: 'perry', matches: 9, runs: 347, wickets: 7, strikeRate: 125.72, sources: [wplBatting, wplBowling] },
      { playerId: 'richa', matches: 10, runs: 257, wickets: null, strikeRate: 141.99, sources: [wplBatting] },
      { playerId: 'devine', matches: 10, runs: 136, wickets: 6, strikeRate: 125.92, sources: ['https://cricxtasy.com/womens-premier-league-wpl/rcb-sophie-devine-pulls-out-of-wpl-2025-takes-break-from-cricket-after-professional-advice/', 'https://www.crictracker.com/cricket-analysis/wpl-2024-flop-xi-of-the-tournament/5/'] },
      { playerId: 'shreyanka', matches: 8, runs: null, wickets: 13, strikeRate: null, sources: [wplBowling] },
      { playerId: 'molineux', matches: 10, runs: null, wickets: 12, strikeRate: null, sources: [wplBowling] },
      { playerId: 'asha', matches: 10, runs: null, wickets: 12, strikeRate: null, sources: [wplBowling] }
    ]
  },
  wpl2026: {
    label: 'WPL 2026',
    source: wplFinal2026,
    records: [
      { playerId: 'smriti', matches: 9, runs: 377, wickets: 0, strikeRate: 153.25, sources: [wplFinal2026, 'https://cricsheet.org/downloads/wpl_json.zip'] },
      { playerId: 'harris', matches: 9, runs: 237, wickets: 2, strikeRate: 178.2, sources: [wplFinal2026, 'https://cricsheet.org/downloads/wpl_json.zip'] },
      { playerId: 'richa', matches: 9, runs: 189, wickets: 0, strikeRate: 151.2, sources: [wplFinal2026, 'https://cricsheet.org/downloads/wpl_json.zip'] },
      { playerId: 'voll', matches: 6, runs: 170, wickets: 0, strikeRate: 126.87, sources: [wplFinal2026, 'https://cricsheet.org/downloads/wpl_json.zip'] },
      { playerId: 'deklerk', matches: 9, runs: 133, wickets: 16, strikeRate: 138.54, sources: [wplFinal2026, 'https://cricsheet.org/downloads/wpl_json.zip'] },
      { playerId: 'bell', matches: 9, runs: 1, wickets: 12, strikeRate: 100, sources: [wplFinal2026, 'https://cricsheet.org/downloads/wpl_json.zip'] },
      { playerId: 'shreyanka', matches: 9, runs: 28, wickets: 11, strikeRate: 164.71, sources: [wplFinal2026, 'https://cricsheet.org/downloads/wpl_json.zip'] }
    ]
  }
};

export const moments = [
  { id: 'ipl-2025', league: 'ipl', date: '03 JUN 2025', tag: 'THE FIRST IPL CROWN', title: 'The wait was worth it.', summary: 'Eighteen seasons. A six-run margin. One unforgettable breakthrough.', story: 'RCB defended 190/9 against Punjab Kings in Ahmedabad to win their maiden IPL title. Krunal Pandya’s 2/17 anchored the middle overs as the team held its nerve to seal a six-run victory.', fact: 'RCB 190/9 · PBKS 184/7', photo: 'virat', photoAlt: 'Virat Kohli in RCB kit at the 2015 IPL opening ceremony', photoContext: 'Illustrative RCB-kit photograph from the 2015 opening ceremony, not the 2025 final.', source: iplFinal2025, linkLabel: 'Read the official match report' },
  { id: 'wpl-2024', league: 'wpl', date: '17 MAR 2024', tag: 'THE WOMEN LEAD THE WAY', title: 'A first crown. A new belief.', summary: 'Smriti’s side brought home RCB’s first WPL championship.', story: 'Delhi Capitals were bowled out for 113 after Sophie Molineux’s three-wicket over changed the game and Shreyanka Patil collected 4/12. RCB reached 115/2 to win by eight wickets, with Ellyse Perry and Richa Ghosh unbeaten at the end.', fact: 'DC 113 · RCB 115/2', photo: 'stadium', photoAlt: 'RCB’s home ground, M. Chinnaswamy Stadium', photoContext: 'Illustrative photograph of RCB’s home ground, not the final venue or a photograph of the women’s team.', source: wplFinal2024, linkLabel: 'Read the official match report' },
  { id: 'ipl-2026', league: 'ipl', date: '2026 FINAL', tag: 'BACK TO BACK', title: 'Belief, defended.', summary: 'A second IPL title, this time against Gujarat Titans.', story: 'The official IPL 2026 final report records Royal Challengers Bengaluru beating Gujarat Titans by five wickets to claim their second IPL title. The club’s maiden 2025 championship became the start of back-to-back title seasons.', fact: 'RCB won by 5 wickets', photo: 'virat', photoAlt: 'Virat Kohli wearing RCB kit in 2015', photoContext: 'Illustrative RCB-kit photograph from 2015, not a photograph of the 2026 final.', source: iplFinal2026, linkLabel: 'Read the official match report' },
  { id: 'wpl-2026', league: 'wpl', date: '2026 FINAL', tag: 'ANOTHER WOMEN’S CROWN', title: 'The next winning chapter.', summary: 'RCB defeated Delhi Capitals to win their second WPL title.', story: 'The official WPL 2026 final report records a six-wicket win over Delhi Capitals and a second championship for RCB. This honours update is separate from the WPL 2024 player-statistics snapshot in the stats lab.', fact: 'RCB won by 6 wickets', photo: 'stadium', photoAlt: 'An archival view of RCB’s home stadium', photoContext: 'Illustrative home-stadium photograph, not a photo of the 2026 final or the women’s squad.', source: wplFinal2026, linkLabel: 'Read the official match report' },
  { id: 'wpl-eliminator', league: 'wpl', date: '15 MAR 2024', tag: 'FIVE RUNS. ALL HEART.', title: 'The final before the final.', summary: 'An Eliminator win over Mumbai Indians opened the door to history.', story: 'RCB beat Mumbai Indians by five runs in the 2024 WPL Eliminator to reach their first final. It was the narrow escape that made the championship opportunity possible.', fact: 'RCB won by 5 runs', photo: 'stadium', photoAlt: 'An archival view of M. Chinnaswamy Stadium', photoContext: 'Illustrative home-stadium photograph, not the Eliminator venue or an image of that match.', source: 'https://www.wplt20.com/news/article/match-report-tata-wpl-2024-eliminator', linkLabel: 'Read the official match report' },
  { id: 'clt20-2011', league: 'clt20', date: '2009–2011', tag: 'THE INTERNATIONAL CLUB STAGE', title: 'Beyond the IPL.', summary: 'RCB competed in CLT20 across 2009–2011, reaching the 2011 final.', story: 'Royal Challengers Bangalore represented the franchise on the international club stage in 2009, 2010, and 2011, reaching the 2011 Champions League Twenty20 final against Mumbai Indians. The photograph shows inaugural captain Rahul Dravid in RCB kit wearing the Champions League T20 sleeve badge.', fact: 'CLT20 2011 · Runners-up', photo: 'dravid', photoAlt: 'Rahul Dravid in RCB franchise kit with the Champions League T20 badge', photoContext: 'Solo photograph of Rahul Dravid in RCB kit with the CLT20 sleeve patch; not a photograph of the 2011 final.', source: 'https://en.wikipedia.org/wiki/2011_Royal_Challengers_Bangalore_season', linkLabel: 'Explore the sourced season history' },
  { id: 'gayle-175', league: 'ipl', date: '23 APR 2013', tag: 'THE UNIVERSE BOSS', title: '175. Not out. Never forgotten.', summary: 'Chris Gayle’s extraordinary innings against Pune Warriors India.', story: 'Gayle’s unbeaten 175 powered RCB to 263/5 against Pune Warriors India in Bengaluru. It became one of the defining individual performances in the franchise’s history.', fact: 'Chris Gayle · 175*', photo: 'stadium', photoAlt: 'An archival photograph of M. Chinnaswamy Stadium', photoContext: 'Illustrative photograph of the home ground, not an image of Gayle or his 175* innings.', source: clubHistory, linkLabel: 'Explore the club’s sourced history' },
  { id: 'virat-973', league: 'ipl', date: '2016 SEASON', tag: 'THE HEARTBEAT', title: 'A season beyond ordinary.', summary: 'Virat Kohli. Four centuries. Nine hundred and seventy-three runs.', story: 'Kohli scored 973 runs in IPL 2016, including four centuries, as RCB reached the final. This is a separate historical milestone and must not be confused with his 657-run IPL 2025 snapshot.', fact: '973 runs · 4 centuries', photo: 'virat', photoAlt: 'Virat Kohli in RCB franchise kit', photoContext: 'Illustrative RCB-kit photograph from the 2015 IPL opening ceremony, not IPL 2016.', source: 'https://www.iplt20.com/', linkLabel: 'Explore the official IPL site' },
  { id: 'green-2024', league: 'ipl', date: '25 APR–18 MAY 2024', tag: '1 WIN IN 8 TO 6 STRAIGHT WINS', title: 'The Miracle of May begins.', summary: 'From bottom of the table to six straight wins and the 18 May knockout over CSK.', story: 'Sitting at the bottom of the table with 1 win from 8 games, RCB ignited a historic 6-match winning streak on 25 April in Hyderabad (206/7 vs SRH 171/8), followed by wins over GT (twice), PBKS, DC, and the 27-run knockout over CSK on 18 May where Yash Dayal defended 17 in the final over. The solo portrait of Cameron Green is cropped from the 25 April Hyderabad award presentation; Rajat Patidar, not Green, was Player of the Match that night.', fact: '6 straight wins · RCB 218/5 beat CSK 191/7', photo: 'green', photoAlt: 'Solo portrait of Cameron Green in RCB kit cropped from the Hyderabad post-match presentation', photoContext: 'Solo portrait cropped from the 25 April 2024 Hyderabad award presentation, not an illustration or another team’s kit.', source: 'https://www.iplt20.com/news/article/tata-ipl-2024-match-41-srh-vs-rcb-match-report', linkLabel: 'Read the official match report' }
];

export const highlightVideos = [
  { id: 'bhuvi-2026', league: 'ipl', year: 2026, category: 'BOWLING REEL', title: 'All 28 wickets. One Bhuvi.', description: 'Every wicket from Bhuvneshwar Kumar’s 2026 campaign.', source: 'https://www.iplt20.com/videos/s-all-28-wickets-by-bhuvneshwar-kumar-in-tata-ipl-2026-ppxd6b' },
  { id: 'rajat-sixes-2026', league: 'ipl', year: 2026, category: 'BATTING REEL', title: '42 reasons to play bold.', description: 'Rajat Patidar’s six-hitting collection from IPL 2026.', source: 'https://www.iplt20.com/videos/s-all-42-sixes-by-rajat-patidar-in-tata-ipl-2026-0y79fo' },
  { id: 'kohli-champion-2026', league: 'ipl', year: 2026, category: 'CHAMPION INTERVIEW', title: 'Champion. Again. Kohli.', description: 'The official post-title conversation with Virat Kohli.', source: 'https://www.iplt20.com/videos/s-in-conversation-with-champion-again-virat-kohli-micokk' },
  { id: 'patidar-captain-2026', league: 'ipl', year: 2026, category: 'CAPTAIN’S PERSPECTIVE', title: 'The captain behind the crown.', description: 'Rajat Patidar reflects on another championship.', source: 'https://www.iplt20.com/videos/s-crowned-captain-rajat-patidar-speaks-kcm6k' },
  { id: 'csk-2024', league: 'ipl', year: 2024, category: 'MATCH HIGHLIGHTS', title: 'That night against Chennai.', description: 'The official highlights of RCB vs CSK, Match 68, 2024.', source: 'https://www.iplt20.com/videos/s-ipl-2024-m68-rcb-vs-csk-match-highlights-4iyaej' },
  { id: 'wpl-champions-2026', league: 'wpl', year: 2026, category: 'WOMEN’S TEAM INTERVIEW', title: 'A campaign to remember.', description: 'Georgia Voll and Grace Harris reflect on the 2026 WPL season.', source: 'https://www.wplt20.com/videos/s-reflecting-on-a-memorable-campaign-with-georgia-voll-and-grace-harris-0faac5r' },
  { id: 'team-champions-2026', league: 'ipl', year: 2026, category: 'IN THE DRESSING ROOM', title: 'The feeling of champions.', description: 'Venkatesh Iyer and Bhuvneshwar Kumar after the title win.', source: 'https://www.iplt20.com/videos/s-the-unmatched-feeling-of-champions-with-venkatesh-iyer-and-bhuvneshwar-kumar-96uu3p' },
  { id: 'opening-night-2008', league: 'ipl', year: 2008, category: 'ARCHIVE MATCH HIGHLIGHTS', title: 'Where it all began.', description: 'The inaugural IPL match: RCB vs Kolkata Knight Riders, 2008.', source: 'https://www.iplt20.com/videos/s-ipl-2008-match-1-highlights-rcb-vs-kkr-k98vjg' },
  { id: 'first-final-2009', league: 'ipl', year: 2009, category: 'ARCHIVE MATCH HIGHLIGHTS', title: 'The first final. The first belief.', description: 'RCB’s 2009 final against Deccan Chargers, from the official archive.', source: 'https://www.iplt20.com/videos/s-ipl-2009-match-59-final-highlights-rcb-vs-dc-nm1ia' }
];

export const logoHistory = [
  {
    id: 'logo-2008',
    src: './assets/logos/logo-2008.png',
    width: 114,
    height: 128,
    years: '2008',
    name: 'The Inaugural Seal',
    bannerText: 'ROYAL CHALLENGERS BANGALORE',
    palette: ['#c91e32', '#f3c623', '#f9f2dc', '#18181b'],
    kitNote: 'Crimson & bright yellow inaugural IPL kit',
    captains: 'Rahul Dravid',
    summary: 'Purchased by United Spirits ($111.6M), RCB debuted on 18 April 2008 with a circular red-and-yellow seal featuring the classic intertwined RC monogram, a golden outer ring, and a small crowned heraldic lion.',
    milestones: 'Inaugural IPL match at M. Chinnaswamy Stadium · Signing of 19-year-old Virat Kohli from the U-19 draft · Rahul Dravid as icon player'
  },
  {
    id: 'logo-2009-2015',
    src: './assets/logos/logo-2009-2015.png',
    width: 114,
    height: 128,
    years: '2009–2015',
    name: 'The Classic Crowned Roundel',
    bannerText: 'ROYAL CHALLENGERS · BANGALORE',
    palette: ['#d11f34', '#d9b56d', '#1c355e', '#f8f3e6'],
    kitNote: 'Royal red, cream-gold & navy shoulders (seen on Dravid’s 2009/10 & Kohli’s 2015 kits)',
    captains: 'Kevin Pietersen · Anil Kumble · Daniel Vettori · Virat Kohli',
    summary: 'Refined in 2009 with a prominent crowned blue-and-gold heraldic lion shield at 12 o’clock above the crimson RC disk and cream-gold ring. This emblem accompanied RCB’s first golden run across IPL and Champions League Twenty20.',
    milestones: '2009 IPL Final (Johannesburg) · 2011 IPL & CLT20 Finals · Launch of the annual Go Green jersey initiative (2011) · Chris Gayle’s 608 & 733 Orange Caps and historic 175* (2013)'
  },
  {
    id: 'logo-2016-2019',
    src: './assets/logos/logo-2016-2019.png',
    width: 114,
    height: 128,
    years: '2016–2019',
    name: 'The Bold Black & Gold Lion Seal',
    bannerText: 'ROYAL CHALLENGERS BANGALORE',
    palette: ['#e5253f', '#111215', '#d7b77c', '#ffffff'],
    kitNote: 'Split home/away red-and-black kits introduced for IPL 2016',
    captains: 'Virat Kohli · Shane Watson',
    summary: 'Introduced alongside the bold black-and-red kit redesign in 2016, the rampant golden lion grew larger and broke above the upper rim of the circular RC monogram, framed by a dark obsidian outer ring.',
    milestones: 'Virat Kohli’s all-time record 973 runs & 4 centuries (2016) · 229-run partnership with AB de Villiers vs Gujarat Lions · 2016 IPL Final at Chinnaswamy'
  },
  {
    id: 'logo-2020-2023',
    src: './assets/logos/logo-2020-2023.png',
    width: 116,
    height: 138,
    years: '2020–2023',
    name: 'The Modernized Rampant Lion',
    bannerText: 'ROYAL CHALLENGERS BANGALORE',
    palette: ['#d4af5f', '#e5253f', '#0f131d', '#f5dc9c'],
    kitNote: 'Red, dark navy/black & gold lion-watermark jerseys',
    captains: 'Virat Kohli · Faf du Plessis',
    summary: 'Unveiled ahead of the 2020 UAE season under Mike Hesson and Simon Katich, this redesign retired the circular RC roundel and elevated a towering, stylized gold crowned rampant lion standing directly atop geometric RCB lettering.',
    milestones: 'Three consecutive playoff berths (2020, 2021, 2022) · Harshal Patel’s 32-wicket Purple Cap (2021) · Rajat Patidar’s 112* in 2022 Eliminator · Hall of Fame induction of AB de Villiers (#17) & Chris Gayle (#333)'
  },
  {
    id: 'logo-2024-2026',
    src: './assets/logos/logo-2024-2026.png',
    width: 116,
    height: 138,
    years: '2024–2026 · CURRENT',
    name: 'The Bengaluru Championship Crest',
    bannerText: 'ROYAL CHALLENGERS BENGALURU',
    palette: ['#d7b77c', '#e5253f', '#101830', '#0d0d10'],
    kitNote: 'Crimson & royal blue/dark navy championship kits with gold lion crest',
    captains: 'Smriti Mandhana (WPL) · Faf du Plessis (2024) · Rajat Patidar (2025–2026)',
    summary: 'Unveiled at RCB Unbox on 19 March 2024—two days after the maiden WPL title—officially renaming the club Royal Challengers Bengaluru. The gold crowned rampant lion and RCB monolith sit above the ROYAL CHALLENGERS BENGALURU inscription.',
    milestones: '2024 WPL Champions · 2024 6-Match Miracle Comeback Streak · 2025 Maiden IPL Title (100% away win record) · 2026 Historic WPL & Back-to-Back IPL Championship Double',
    isCurrent: true
  }
];

export const eraChapters = [
  {
    id: 'era-1',
    era: 'ERA 01 · 2008–2010',
    title: 'The Founding & Kumble’s Resurgence',
    subtitle: 'From the first ball of the IPL to the Johannesburg Final and CLT20 qualification.',
    highlights: [
      '2008 (7th · 4W–10L): Purchased by Vijay Mallya (United Spirits) for $111.6M (second-highest bid). Rahul Dravid named icon player; 19-year-old Virat Kohli signed from the U-19 draft. Hosted the first-ever IPL match on 18 April 2008 vs KKR (McCullum 158* off 73). Criticized for a "Test-heavy" lineup (Dravid, Kallis, Kumble, Chanderpaul, Jaffer), leading to CEO Charu Sharma’s mid-season departure.',
      '2009 (Runners-Up · 9W–7L): Hosted in South Africa; Kevin Pietersen signed for a record $1.55M. After starting 2–4 and Pietersen leaving for national duty, Anil Kumble took over as captain, taking 5/5 vs RR. Manish Pandey became the first Indian to score an IPL century (114* vs DC). Beat CSK in the semi-final before falling 6 runs short vs Deccan Chargers in the Final despite Kumble’s 4/16.',
      '2010 (Playoffs 3rd · 8W–8L): Under Kumble and Robin Uthappa’s power-hitting, RCB finished 4th in the league, lost the semi-final to MI by 35 runs, and routed Deccan Chargers by 9 wickets in the 3rd-place playoff to qualify for CLT20 (Kumble’s farewell tournament).'
    ]
  },
  {
    id: 'era-2',
    era: 'ERA 02 · 2011–2013',
    title: 'The "Gayle Storm" & Vettori Years',
    subtitle: 'Back-to-back Orange Caps, a 7-match winning streak, the Go Green initiative, and 175* (263/5).',
    highlights: [
      '2011 (Runners-Up · 10W–6L, 1 NR): Signed AB de Villiers and named Daniel Vettori captain. When Dirk Nannes was injured mid-season, RCB signed unsold Chris Gayle as a replacement—who hit a debut century vs KKR, won the Orange Cap (608 runs in 12 innings), and powered a franchise-record 7-match winning streak to top the table (1st). Reached both the IPL Final (vs CSK) and 2011 CLT20 Final (vs MI), and launched the annual "Go Green" environmental jersey initiative.',
      '2012 (5th · 8W–7L, 1 NR): Chris Gayle became the first player to win consecutive Orange Caps (733 runs, 59 sixes). Vinay Kumar and Zaheer Khan led the pace attack, AB de Villiers pulled off a last-over heist vs Dale Steyn, and Vettori handed on-field captaincy to Virat Kohli mid-season. Missed playoffs on NRR after a 9-run loss to Deccan Chargers in the final league game.',
      '2013 (5th · 9W–7L, 1W/1L Super Overs): Virat Kohli named full-time captain. On 23 April 2013 vs Pune Warriors India, Chris Gayle blasted 175* off 66 balls (30-ball century, highest individual T20 score), propelling RCB to 263/5—an IPL team record that stood for 11 years.'
    ]
  },
  {
    id: 'era-3',
    era: 'ERA 03 · 2014–2016',
    title: 'The Kohli–AB de Villiers Peak & 2016 Heartbreak',
    subtitle: 'Starc & Chahal arrive, 215- and 229-run partnerships, and Kohli’s 973-run four-century season.',
    highlights: [
      '2014 (7th · 5W–9L): Bought Yuvraj Singh for a record ₹14 crore and signed Mitchell Starc and Yuzvendra Chahal. AB de Villiers smashed 24 off a single Dale Steyn over, while death-bowling struggles (including Albie Morkel’s 28-run 19th over vs MS Dhoni) saw RCB finish 7th.',
      '2015 (Playoffs 3rd · 8W–6L, 2 NR): Starc (20 wickets) and Chahal (23 wickets) balanced the attack. AB de Villiers hammered 133* off 59 balls vs MI at Wankhede in a 215-run stand with Kohli. Crushed RR by 71 runs in the Eliminator before losing Qualifier 2 to CSK in Ranchi by 3 wickets.',
      '2016 (Runners-Up · 9W–7L): As United Spirits (Diageo) took full operational control, RCB sat at 2 wins in 7 games before Virat Kohli produced the greatest batting campaign in T20 history: 973 runs and 4 centuries (batting with stitches in his left hand). Kohli (109) and AB (129*) shared an all-time record 229-run stand vs Gujarat Lions (248/3). AB’s 79* from 29/5 won Q1 vs GL, before RCB fell 8 runs short chasing 209 vs SRH in the Chinnaswamy Final despite a 114-run opening stand.'
    ]
  },
  {
    id: 'era-4',
    era: 'ERA 04 · 2017–2021',
    title: 'The Slump & UAE Playoffs Return',
    subtitle: 'From the 49 all-out nadir to the modernized lion crest, Harshal’s 32 wickets, and AB’s farewell.',
    highlights: [
      '2017–2019 (8th, 6th, 8th): Early injuries to Kohli and KL Rahul marked 2017, where Samuel Badree’s hat-trick vs MI (14 April) was followed on 23 April by RCB being bowled out for 49 in 9.4 overs vs KKR at Eden Gardens (lowest total in IPL history). After releasing Gayle in 2018 (marked by AB’s "Spiderman" boundary catch vs SRH) and starting 0–6 in 2019 despite Kohli’s 5th IPL ton (100 vs KKR), the club rebuilt its leadership.',
      '2020 (Playoffs 4th · 7W–8L, 1W Super Over): Mike Hesson (Director of Cricket) and Simon Katich (Head Coach) unveiled the modernized gold-and-red lion logo. Rookie Devdutt Padikkal won the Emerging Player award (473 runs) as RCB ended a 3-year playoff drought in the UAE.',
      '2021 (Playoffs 4th / 3rd League · 9W–6L): Traded from Delhi, Harshal Patel took a hat-trick vs MI and equaled the all-time single-season record with 32 wickets (Purple Cap), while Glenn Maxwell scored 513 runs and KS Bharat hit a last-ball six vs DC. Virat Kohli stepped down after 9 years as captain, and AB de Villiers retired from all cricket in November 2021.'
    ]
  },
  {
    id: 'era-5',
    era: 'ERA 05 · 2022–2024',
    title: 'Faf du Plessis, Rebranding & The 2024 Miracle',
    subtitle: 'Patidar’s 112*, Hall of Fame #17 & #333, WPL Champions, the Bengaluru name, and the 1% miracle.',
    highlights: [
      '2022 (Playoffs 3rd / 4th League · 9W–7L): Released Yuzvendra Chahal (all-time leading wicket-taker with 139 wickets), appointed Faf du Plessis captain, and signed finisher Dinesh Karthik (330 runs at 183.33 SR). Injury replacement Rajat Patidar became the first uncapped player to score an IPL playoff century (112* off 54 vs LSG in the Eliminator).',
      '2023 (6th · 7W–7L): Inducted AB de Villiers and Chris Gayle into the RCB Hall of Fame, retiring jerseys #17 and #333. The "KGF" trio—Kohli (639 runs, back-to-back centuries), Faf (730 runs), and Maxwell (400 runs)—scored 1,769 runs and RCB bowled RR out for 59 in Jaipur, missing playoffs on the final day.',
      '2024 (Playoffs 4th · 7W–8L): Under Andy Flower, Smriti Mandhana’s RCB Women won the franchise’s first major trophy on 17 March 2024 (WPL Final vs DC), followed two days later by the RCB Unbox rebrand to Royal Challengers Bengaluru. After SRH’s 287/3 vs RCB’s 262/7 (DK 83 off 35; 549-run T20 record) left RCB at 1 win in 8 games (<1% odds), RCB reeled off 6 straight wins—capped by Yash Dayal defending 17 in the final over vs Dhoni & Jadeja on 18 May to beat CSK by 27 runs. Kohli won his 2nd Orange Cap (741 runs), and DK transitioned to batting coach and mentor.'
    ]
  },
  {
    id: 'era-6',
    era: 'ERA 06 · 2025–2026',
    title: 'The Golden Era — Back-to-Back Champions',
    subtitle: '18 years to "Ee Sala Cup Namde", 100% away wins in 2025, and the 2026 WPL–IPL Double.',
    highlights: [
      '2025 (CHAMPIONS · 11W–4L, 1 NR): Retained Virat Kohli (₹21 Cr), Rajat Patidar (₹11 Cr, named captain), and Yash Dayal (₹5 Cr) ahead of the Jeddah Mega Auction, signing Josh Hazlewood, Phil Salt, Bhuvneshwar Kumar, Krunal Pandya, Jitesh Sharma, and Liam Livingstone. Finished 2nd (19 pts) and became the first team in IPL history to win 100% of their away matches. Routed PBKS in Q1 (101 all out, chased in 10 overs) and beat PBKS by 6 runs in the 3 June Final at Ahmedabad (RCB 190/9 vs PBKS 184/7; Krunal Pandya 2/17 POTM; Kohli 657 runs; Hazlewood 22 wickets). Tragically, celebrations the next day were marred by a crowd crush outside Chinnaswamy Stadium.',
      '2026 (BACK-TO-BACK CHAMPIONS & WPL–IPL DOUBLE · 11W–5L): On 5 Feb 2026, Smriti Mandhana’s RCB Women chased a WPL-record 204 vs DC in Vadodara for their 2nd WPL crown. In IPL 2026, Patidar’s men topped the league table (1st, 18 pts, 9–5) behind Kohli (675 runs, 105*), Patidar (501 runs, 42 sixes), Bhuvneshwar (28 wickets), Rasikh Salam (19 wickets), and Hazlewood (15 wickets, 4/12). After routing GT by 92 runs in Q1 (254/5), RCB restricted GT to 155/8 (Rasikh 3/27) in the 31 May Final and chased 161/5 in 18 overs via Kohli’s 75* off 42 (POTM) to win by 5 wickets—becoming the 3rd franchise to defend an IPL title back-to-back and the 1st ever to win the WPL and IPL in the same calendar year. Captain Rajat Patidar dedicated the 2026 trophy to the victims of the 2025 Bengaluru crowd crush.'
    ]
  }
];

export const teamSeasons = [
  { year: 2008, era: 'Era 1 (2008–2010)', captain: 'Rahul Dravid', played: 14, won: 4, lost: 10, noResult: 0, nrTied: '0', leaguePosition: 7, finalResult: 'League Stage', highlight: 'Hosted first-ever IPL match vs KKR ($111.6M franchise bid; 19-year-old Kohli drafted).', story: 'Purchased by Vijay Mallya (United Spirits) for $111.6 million—the second-highest bid in the league—RCB selected Rahul Dravid as icon player and signed a 19-year-old Virat Kohli from the U-19 draft. On 18 April 2008, RCB hosted the first-ever IPL match at M. Chinnaswamy Stadium (where KKR’s Brendon McCullum hit 158* off 73). Criticized for a "Test-heavy" lineup (Dravid, Kallis, Kumble, Chanderpaul, Wasim Jaffer), RCB finished 7th (4W–10L) and parted ways with CEO Charu Sharma mid-season.' },
  { year: 2009, era: 'Era 1 (2008–2010)', captain: 'Kevin Pietersen / Anil Kumble', played: 16, won: 9, lost: 7, noResult: 0, nrTied: '0', leaguePosition: 3, finalResult: 'Runners-Up', highlight: 'Lost Final to Deccan Chargers by 6 runs; Kumble 5/5 vs RR & 4/16 in Final; Pandey 114*.', story: 'Hosted in South Africa, RCB signed Kevin Pietersen for a then-record $1.55M as captain. After starting 2–4 and Pietersen departing for national duty, Anil Kumble took over, taking 5/5 vs defending champions Rajasthan Royals and sparking a turnaround. Manish Pandey became the first Indian to score an IPL century (114* vs Deccan Chargers). RCB beat CSK in the semi-final before falling 6 runs short against Deccan Chargers in the Johannesburg final despite Kumble’s 4/16.' },
  { year: 2010, era: 'Era 1 (2008–2010)', captain: 'Anil Kumble', played: 16, won: 8, lost: 8, noResult: 0, nrTied: '0', leaguePosition: 4, finalResult: 'Playoffs (3rd)', highlight: 'Qualified for CLT20 after routing Deccan Chargers by 9 wickets; Kumble’s final IPL.', story: 'Under Anil Kumble’s leadership and Robin Uthappa’s power-hitting, RCB finished 4th in the league stage (8W–8L). After losing the semi-final to Mumbai Indians by 35 runs, RCB routed Deccan Chargers by 9 wickets in the 3rd-place playoff to qualify for the Champions League T20—Kumble’s farewell tournament with the ball.' },
  { year: 2011, era: 'Era 2 (2011–2013)', captain: 'Daniel Vettori', played: 17, won: 10, lost: 6, noResult: 1, nrTied: '1 NR', leaguePosition: 1, finalResult: 'Runners-Up', highlight: 'Gayle (608 runs, Orange Cap); 7-game win streak; lost IPL Final to CSK & CLT20 Final to MI.', story: 'RCB signed AB de Villiers and appointed Daniel Vettori captain. When fast bowler Dirk Nannes suffered a mid-season injury, RCB signed unsold Chris Gayle as a replacement. Gayle hit a century on debut vs KKR, won the Orange Cap (608 runs in 12 innings), and powered a franchise-record 7-match winning streak to finish 1st. RCB beat MI in Qualifier 2 before losing the IPL Final to CSK by 58 runs and the 2011 CLT20 Final to MI. RCB also launched its annual "Go Green" conservation jersey initiative in 2011.' },
  { year: 2012, era: 'Era 2 (2011–2013)', captain: 'Daniel Vettori / Virat Kohli', played: 16, won: 8, lost: 7, noResult: 1, nrTied: '1 NR', leaguePosition: 5, finalResult: 'League Stage', highlight: 'Gayle wins 2nd consecutive Orange Cap (733 runs, 59 sixes); Kohli takes on-field captaincy.', story: 'Chris Gayle became the first player in history to win consecutive Orange Caps, amassing 733 runs and 59 sixes. Vinay Kumar and Zaheer Khan led the pace attack, and AB de Villiers pulled off a famous last-over heist against Dale Steyn. Mid-season, Vettori stepped aside from the XI and handed on-field captaincy to Virat Kohli. Needing a win in their final game against Deccan Chargers, RCB lost by 9 runs and missed the playoffs on NRR.' },
  { year: 2013, era: 'Era 2 (2011–2013)', captain: 'Virat Kohli', played: 16, won: 9, lost: 7, noResult: 0, nrTied: '1W / 1L (T)', leaguePosition: 5, finalResult: 'League Stage', highlight: 'Gayle’s 175* (30-ball ton) & record 263/5 vs PWI; two Super Overs.', story: 'Virat Kohli was officially named full-time captain. On 23 April 2013 against Pune Warriors India, Chris Gayle blasted an unbeaten 175* off 66 balls—the fastest century in cricket history (30 balls) and highest individual T20 score—propelling RCB to 263/5, an IPL record for 11 years. Despite winning 6 of their first 7 home games and playing two Super Overs (winning one vs Delhi, losing one vs SRH), away struggles left RCB 5th on 18 points.' },
  { year: 2014, era: 'Era 3 (2014–2016)', captain: 'Virat Kohli', played: 14, won: 5, lost: 9, noResult: 0, nrTied: '0', leaguePosition: 7, finalResult: 'League Stage', highlight: 'Yuvraj bought for record ₹14 Cr; Mitchell Starc & Yuzvendra Chahal join.', story: 'RCB bought Yuvraj Singh for a record ₹14 crore and signed Mitchell Starc and Yuzvendra Chahal. Despite AB de Villiers smashing 24 runs off a single Dale Steyn over, death-bowling struggles—including Albie Morkel conceding 28 runs in the 19th over to CSK’s MS Dhoni—saw RCB finish 7th (5W–9L).' },
  { year: 2015, era: 'Era 3 (2014–2016)', captain: 'Virat Kohli', played: 16, won: 8, lost: 6, noResult: 2, nrTied: '2 NR', leaguePosition: 3, finalResult: 'Playoffs (3rd)', highlight: 'AB’s 133* at Wankhede in 215-run stand with Kohli; crushed RR in Eliminator; lost Q2 to CSK.', story: 'Boosted by Mitchell Starc (20 wickets) and Yuzvendra Chahal (23 wickets), RCB’s bowling matched its batting firepower. AB de Villiers hammered 133* off 59 balls against Mumbai Indians at Wankhede during a 215-run partnership with Kohli. RCB crushed Rajasthan Royals by 71 runs in the Eliminator before losing Qualifier 2 to CSK in Ranchi by 3 wickets.' },
  { year: 2016, era: 'Era 3 (2014–2016)', captain: 'Virat Kohli', played: 16, won: 9, lost: 7, noResult: 0, nrTied: '0', leaguePosition: 2, finalResult: 'Runners-Up', highlight: 'Kohli’s record 973 runs & 4 tons; 229-run stand with AB; lost Final to SRH by 8 runs.', story: 'As Vijay Mallya stepped down and United Spirits (Diageo) took full operational control, RCB sat at 2 wins in 7 games midway through 2016. Virat Kohli then produced the greatest batting campaign in T20 history—973 runs and 4 centuries, batting with multiple stitches in his left hand late in the season. Against Gujarat Lions, Kohli (109) and AB de Villiers (129*) shared an all-time record 229-run partnership (248/3). Winning 6 of their last 7 league games to finish 2nd, AB rescued RCB from 29/5 with 79* in Q1 vs GL. In the Chinnaswamy Final chasing 209 vs SRH, Gayle and Kohli added 114 in 10.3 overs before RCB fell 8 runs short.' },
  { year: 2017, era: 'Era 4 (2017–2021)', captain: 'Virat Kohli / Shane Watson', played: 14, won: 3, lost: 10, noResult: 1, nrTied: '1 NR', leaguePosition: 8, finalResult: 'League Stage', highlight: 'Samuel Badree hat-trick vs MI; bowled out for record-low 49 in 9.4 overs vs KKR.', story: 'Plagued by early-season injuries to Kohli and KL Rahul, RCB endured their toughest campaign. Samuel Badree took a hat-trick against MI on 14 April, but nine days later on 23 April 2017 at Eden Gardens, chasing 132 against KKR, RCB was bundled out for 49 in 9.4 overs—the lowest team total in IPL history, with no batter reaching double digits.' },
  { year: 2018, era: 'Era 4 (2017–2021)', captain: 'Virat Kohli', played: 14, won: 6, lost: 8, noResult: 0, nrTied: '0', leaguePosition: 6, finalResult: 'League Stage', highlight: 'Chris Gayle released; AB de Villiers takes iconic "Spiderman" boundary catch vs SRH.', story: 'RCB released Chris Gayle ahead of the mega auction, retaining Virat Kohli, AB de Villiers, and Sarfaraz Khan. Despite AB de Villiers taking the iconic one-handed "Spiderman" boundary catch against SRH, RCB finished 6th (6W–8L), one win short of the playoffs.' },
  { year: 2019, era: 'Era 4 (2017–2021)', captain: 'Virat Kohli', played: 14, won: 5, lost: 8, noResult: 1, nrTied: '1 NR', leaguePosition: 8, finalResult: 'League Stage', highlight: 'Started 0–6 under Gary Kirsten; Kohli’s 5th IPL century (100 vs KKR).', story: 'Under coach Gary Kirsten, RCB lost their first 6 matches in a row. Although Virat Kohli scored his 5th IPL century (100 vs KKR) and Dale Steyn briefly returned to spark a second-half revival, a rain-washed 5-over match against RR (where Shreyas Gopal took a hat-trick) sealed an 8th-place finish.' },
  { year: 2020, era: 'Era 4 (2017–2021)', captain: 'Virat Kohli', played: 15, won: 7, lost: 8, noResult: 0, nrTied: '1W (T)', leaguePosition: 4, finalResult: 'Playoffs (4th)', highlight: 'Ended 3-year playoff drought in UAE; new gold lion logo; Devdutt Padikkal Emerging Player (473 runs).', story: 'Mike Hesson (Director of Cricket) and Simon Katich (Head Coach) took charge and unveiled the modernized gold-and-red lion logo. Rookie Devdutt Padikkal won the Emerging Player award (473 runs), and RCB broke their 3-year playoff drought in the UAE (including a Super Over win) before losing to SRH in the Eliminator.' },
  { year: 2021, era: 'Era 4 (2017–2021)', captain: 'Virat Kohli', played: 15, won: 9, lost: 6, noResult: 0, nrTied: '0', leaguePosition: 3, finalResult: 'Playoffs (4th)', highlight: 'Harshal Patel’s 32 wickets (Purple Cap & hat-trick); Maxwell 513 runs; Kohli steps down & AB retires.', story: 'Traded from Delhi, Harshal Patel took a hat-trick against MI and equaled Dwayne Bravo’s all-time single-season record with 32 wickets to win the Purple Cap. Glenn Maxwell revitalized the middle order (513 runs), and KS Bharat hit a last-ball six to beat DC. Virat Kohli stepped down as RCB captain after 9 years in charge, and AB de Villiers retired from all cricket in November 2021.' },
  { year: 2022, era: 'Era 5 (2022–2024)', captain: 'Faf du Plessis', played: 16, won: 9, lost: 7, noResult: 0, nrTied: '0', leaguePosition: 4, finalResult: 'Playoffs (3rd)', highlight: 'Patidar’s 112* off 54 in Eliminator vs LSG; Faf named captain; DK 330 runs at 183.33 SR.', story: 'RCB released Yuzvendra Chahal (their all-time leading wicket-taker with 139 wickets), appointed Faf du Plessis captain, and signed Dinesh Karthik as a specialist finisher (330 runs at a 183.33 strike rate). In the Eliminator against Lucknow Super Giants, injury replacement Rajat Patidar became the first uncapped player to score an IPL playoff century (112* off 54 balls) before RCB lost Qualifier 2 to RR.' },
  { year: 2023, era: 'Era 5 (2022–2024)', captain: 'Faf du Plessis / Virat Kohli', played: 14, won: 7, lost: 7, noResult: 0, nrTied: '0', leaguePosition: 6, finalResult: 'League Stage', highlight: '"KGF" trio scores 1,769 runs; Hall of Fame #17 & #333 retired; bowled RR out for 59.', story: 'RCB inducted AB de Villiers and Chris Gayle as the inaugural members of the RCB Hall of Fame and retired jersey numbers 17 and 333. The top-order "KGF" trio of Kohli (639 runs, back-to-back centuries), Faf du Plessis (730 runs), and Glenn Maxwell (400 runs) combined for 1,769 runs, and RCB bowled Rajasthan Royals out for 59 in Jaipur, before Shubman Gill’s final-day century for GT knocked RCB out.' },
  { year: 2024, era: 'Era 5 (2022–2024)', captain: 'Faf du Plessis', played: 15, won: 7, lost: 8, noResult: 0, nrTied: '0', leaguePosition: 4, finalResult: 'Playoffs (4th)', highlight: 'WPL Champions (17 Mar); renamed "Bengaluru"; 6-game win streak from 1–7 (<1% odds); Kohli Orange Cap (741).', story: 'Under head coach Andy Flower, Smriti Mandhana’s RCB Women beat Delhi Capitals on 17 March 2024 to win the club’s first major trophy, and two days later at RCB Unbox the franchise officially became Royal Challengers Bengaluru. After SRH posted 287/3 and Dinesh Karthik’s 83 (35) lifted RCB to 262/7 (549 combined runs, highest in T20 history), RCB sat bottom at 1 win from 8 games (<1% playoff odds)—then reeled off 6 straight wins, capped on 18 May when Yash Dayal defended 17 in the final over vs MS Dhoni and Ravindra Jadeja to beat CSK by 27 runs. Kohli won his 2nd Orange Cap (741 runs), and DK retired to become batting coach and mentor.' },
  { year: 2025, era: 'Era 6 (2025–2026)', captain: 'Rajat Patidar', played: 16, won: 11, lost: 4, noResult: 1, nrTied: '1 NR', leaguePosition: 2, finalResult: 'CHAMPIONS', highlight: '1st IPL Title after 18 seasons; beat PBKS by 6 runs in Final (Krunal 2/17 POTM); 100% away win record.', story: 'Ahead of the Jeddah Mega Auction, RCB retained Virat Kohli (₹21 Cr), Rajat Patidar (₹11 Cr, named captain), and Yash Dayal (₹5 Cr), signing Josh Hazlewood, Phil Salt, Bhuvneshwar Kumar, Krunal Pandya, Jitesh Sharma, and Liam Livingstone. Finishing 2nd (19 points) and becoming the first team in IPL history to win 100% of their away matches, RCB bowled PBKS out for 101 in Q1 (chased in 10 overs) and posted 190/9 (Kohli 43, Livingstone 25, Jitesh 24) in the 3 June Final at Ahmedabad. Krunal Pandya’s 2/17 (POTM) restricted PBKS to 184/7 for a 6-run win—fulfilling "Ee Sala Cup Namde" after 18 seasons (Kohli 657 runs, Hazlewood 22 wickets). Tragically, celebrations in Bengaluru the next day were marred by a crowd crush outside Chinnaswamy Stadium.' },
  { year: 2026, era: 'Era 6 (2025–2026)', captain: 'Rajat Patidar', played: 16, won: 11, lost: 5, noResult: 0, nrTied: '0', leaguePosition: 1, finalResult: 'CHAMPIONS', highlight: '2nd IPL Title (Back-to-Back) & WPL–IPL Double; beat GT by 5 wkts in Final (Kohli 75* POTM).', story: 'On 5 February 2026, Smriti Mandhana’s RCB Women chased a WPL-record 204 vs DC in Vadodara to win their 2nd WPL title. In IPL 2026, Rajat Patidar’s men finished 1st in the league table (9–5, 18 points) behind Kohli (675 runs, including 105*), Patidar (501 runs, 42 sixes), Bhuvneshwar Kumar (28 wickets), Rasikh Salam (19 wickets), and Josh Hazlewood (15 wickets, best 4/12). After routing GT by 92 runs in Q1 (254/5), RCB restricted GT to 155/8 (Rasikh 3/27) in the 31 May Final at Ahmedabad and chased 161/5 in 18 overs via Kohli’s 75* off 42 balls (POTM) to win by 5 wickets—becoming the 3rd franchise in IPL history to defend a title back-to-back and the 1st ever to complete the WPL–IPL calendar double. Patidar dedicated the 2026 trophy to the victims of the 2025 Bengaluru crowd crush.' }
];

export function seasonWinRate(record) {
  const completed = record.played - record.noResult;
  return completed ? Number((record.won / completed * 100).toFixed(1)) : null;
}

export const researchSources = [
  { title: 'Cricsheet — match data and register', url: 'https://cricsheet.org/', scope: 'All downloaded RCB IPL/WPL match participants and delivery-derived seasonal totals; Open Data Commons Attribution License 1.0' },
  { title: 'Cricsheet — JSON methodology', url: 'https://cricsheet.org/format/json/', scope: 'Data schema for batting, bowling, extras, dismissals, replacements, and match listings' },
  { title: 'Cricsheet — licensing', url: 'https://cricsheet.org/licensing/', scope: 'Attribution and terms for transformed downloadable data' },
  { title: 'Royal Challengers Bengaluru — Wikipedia', url: clubHistory, scope: 'Club history, IPL and CLT20 context; requested reference' },
  { title: 'Indian Premier League — official website', url: 'https://www.iplt20.com/', scope: 'Official competition reference' },
  { title: 'RCB squad — IPLT20', url: 'https://www.iplt20.com/teams/royal-challengers-bengaluru/squad', scope: 'Official current squad; separate from the historical player selection' },
  { title: 'IPLT20 — official photo galleries', url: 'https://www.iplt20.com/photos', scope: 'External gallery link only; photos are not copied or hotlinked' },
  { title: 'IPLT20 — terms of use', url: 'https://www.iplt20.com/terms-and-conditions', scope: 'Written authorization is required to republish its photographs' },
  { title: 'Women’s Premier League — official website', url: 'https://www.wplt20.com/', scope: 'Official women’s competition reference' },
  { title: 'RCB women — WPLT20', url: 'https://www.wplt20.com/teams/royal-challengers-bengaluru', scope: 'Official current women’s team directory; requested reference' },
  { title: 'WPL teams — official directory', url: 'https://www.wplt20.com/teams', scope: 'Official women’s league team directory; requested reference' },
  { title: 'IPL 2025 final — official report', url: iplFinal2025, scope: 'Maiden IPL title and final score' },
  { title: 'IPL 2026 final — official report', url: iplFinal2026, scope: 'Second IPL title, five-wicket margin' },
  { title: 'WPL 2024 final — official report', url: wplFinal2024, scope: 'Maiden women’s title' },
  { title: 'WPL 2026 final — official report', url: wplFinal2026, scope: 'Second women’s title, six-wicket margin' },
  { title: 'Cricbuzz — IPL 2025 batting', url: iplBatting, scope: 'Secondary statistical source; full-season totals' },
  { title: 'Cricbuzz — IPL 2025 bowling', url: iplBowling, scope: 'Secondary statistical source; wickets and matches' },
  { title: 'India TV — RCB’s IPL 2025 leading scorers', url: iplScorers, scope: 'Patidar, Salt, and Jitesh batting totals' },
  { title: 'Cricbuzz — WPL 2024 batting', url: wplBatting, scope: 'Secondary statistical source; full-season totals' },
  { title: 'Cricbuzz — WPL 2024 bowling', url: wplBowling, scope: 'Secondary statistical source; wickets and matches' },
  { title: 'Getty Images — RCB editorial archive', url: 'https://www.gettyimages.com/photos/rcb', scope: 'External editorial photo gallery reference; copyrighted agency images are linked externally, not copied into the repository' },
  { title: 'Pinterest — RCB team visual board', url: 'https://www.pinterest.com/ideas/rcb-team/945061772190/', scope: 'External community visual board reference; third-party images are linked externally, not copied into the repository' }
];

function snapshotFor(league) {
  const snapshot = snapshots[league];
  if (!snapshot) throw new RangeError(`No statistical snapshot for ${league}`);
  return snapshot;
}

export function rankStats(league, metric) {
  if (!Object.hasOwn(metrics, metric)) throw new RangeError(`Unknown metric: ${metric}`);
  return [...snapshotFor(league).records].sort((a, b) => {
    if (a[metric] === null && b[metric] !== null) return 1;
    if (b[metric] === null && a[metric] !== null) return -1;
    return (b[metric] ?? 0) - (a[metric] ?? 0) ||
      players.find(player => player.id === a.playerId).name.localeCompare(players.find(player => player.id === b.playerId).name);
  });
}

export function compareStats(league, first, second) {
  if (first === second) throw new RangeError('Choose two different players');
  const records = snapshotFor(league).records;
  const a = records.find(record => record.playerId === first);
  const b = records.find(record => record.playerId === second);
  if (!a || !b) throw new RangeError('Both players must belong to the same statistical snapshot');
  return {
    a, b,
    rows: Object.entries(metrics).map(([key, label]) => {
      const maximum = Math.max(a[key] ?? 0, b[key] ?? 0);
      return { key, label, a: a[key], b: b[key], leftWidth: maximum ? (a[key] ?? 0) / maximum * 100 : 0, rightWidth: maximum ? (b[key] ?? 0) / maximum * 100 : 0 };
    })
  };
}
