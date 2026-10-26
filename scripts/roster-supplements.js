const player = (name, notes = '') => ({ name, country: null, role: null, batting: null, bowling: null, notes, profile: null });
const wpl2025Source = 'https://timesofindia.indiatimes.com/sports/cricket/wpl/royal-challengers-bengaluru-squad-wpl-2025-complete-rcb-team-and-players-list/articleshow/116339509.cms';
const wpl2025Replacements = 'https://femalecricket.com/wpl-2025/61623-wpl-2025-complete-list-of-player-replacements.html';
const wpl2026Source = 'https://www.crictracker.com/cricket-news/rcb-women-team-2026-player-list-complete-royal-challengers-bengaluru-women-squad-for-wpl-2026-8971/';

export const reportedRosters = {
  2023: {
    source: 'https://www.thecricketblog.info/2023/02/22/royal-challengers-bangalore-wpl-squad-list-2023-royal-challengers-bangalore-womens-ipl-team-full-roster-for-inaugural-season/',
    sourceNote: 'Factual name list compiled from the reported 18-player inaugural squad. Player descriptions and images are not reproduced.',
    players: ['Smriti Mandhana', 'Richa Ghosh', 'Disha Kasat', 'Indrani Roy', 'Renuka Singh', 'Preeti Bose', 'Komal Zanzad', 'Megan Schutt', 'Sahana Pawar', 'Ellyse Perry', 'Sophie Devine', 'Erin Burns', 'Kanika Ahuja', 'Asha Sobhana', 'Shreyanka Patil', 'Heather Knight', 'Poonam Khemnar', 'Dane van Niekerk'].map(name => player(name))
  },
  2025: {
    source: wpl2025Source,
    additionalSources: [wpl2025Replacements, 'https://www.wplt20.com/news/article/sneh-rana-joins-rcb-as-injury-replacement-for-shreyanka-patil'],
    sourceNote: 'Reported squad names with documented withdrawals and replacements retained as historical entries. This is not a list of 23 simultaneously active registrations.',
    players: ['Smriti Mandhana', 'Nuzhat Parween', 'Joshitha VJ', 'Richa Ghosh', 'Danni Wyatt', 'Kanika Ahuja', 'Sabbhineni Meghana', 'Ekta Bisht', 'Kim Garth', 'Ellyse Perry', 'Prema Rawat', 'Georgia Wareham', 'Raghvi Bist', 'Heather Graham', 'Jagravi Pawar', 'Renuka Singh', 'Charlie Dean'].map(name => player(name)).concat([
      player('Shreyanka Patil', 'Ruled out injured; replaced by Sneh Rana.'),
      player('Sneh Rana', 'Injury replacement for Shreyanka Patil.'),
      player('Sophie Devine', 'Withdrew; replaced by Heather Graham.'),
      player('Kate Cross', 'Withdrew; replaced by Kim Garth.'),
      player('Sophie Molineux', 'Injured; replaced by Charlie Dean.'),
      player('Asha Sobhana', 'Injured; replaced by Nuzhat Parween.')
    ])
  },
  2026: {
    source: wpl2026Source,
    additionalSources: ['https://www.royalchallengers.com/rcb-cricket-news/news/sayali-satghare-inspired-by-ellyse-perry-and-virat-kohli-now-in-rcb-colours'],
    sourceNote: 'Reported auction squad with Perry’s subsequent withdrawal and Sayali Satghare’s replacement entry preserved. Statistics are only recorded for actual match participants.',
    players: ['Smriti Mandhana', 'Richa Ghosh', 'Shreyanka Patil', 'Georgia Voll', 'Nadine de Klerk', 'Radha Yadav', 'Lauren Bell', 'Linsey Smith', 'Prema Rawat', 'Arundhati Reddy', 'Pooja Vastrakar', 'Grace Harris', 'Gautami Naik', 'Kumar Prathyoosha', 'Dayalan Hemalatha'].map(name => player(name)).concat([
      player('Ellyse Perry', 'Withdrew before the season; replaced by Sayali Satghare.'),
      player('Sayali Satghare', 'Replacement for Ellyse Perry.')
    ])
  }
};
