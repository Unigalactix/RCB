export const aliases = ['Royal Challengers Bangalore', 'Royal Challengers Bengaluru'];
const nonBowlerDismissals = new Set(['run out', 'retired hurt', 'retired out', 'obstructing the field']);

export function aggregateMatches(matches, league) {
  const seasons = new Map();
  for (const { id, match } of matches) {
    const team = match.info.teams.find(name => aliases.includes(name));
    if (!team) continue;
    if ((league === 'wpl') !== (match.info.gender === 'female')) throw new Error(`Competition/gender mismatch in ${id}`);
    const year = Number(String(match.info.dates[0]).slice(0, 4));
    if (!seasons.has(year)) seasons.set(year, { year, matchIds: [], firstDate: match.info.dates[0], lastDate: match.info.dates[0], players: new Map() });
    const season = seasons.get(year);
    season.matchIds.push(id);
    season.firstDate = [season.firstDate, match.info.dates[0]].sort()[0];
    season.lastDate = [season.lastDate, match.info.dates[0]].sort().at(-1);
    const identities = match.info.registry.people;
    const listed = new Set();
    function player(name) {
      const identifier = identities[name];
      if (!identifier) throw new Error(`Missing registry identity for ${name} in ${id}`);
      if (!season.players.has(identifier)) season.players.set(identifier, {
        id: identifier, name, matchListings: 0, battingInnings: 0, runs: 0, ballsFaced: 0,
        fours: 0, sixes: 0, dismissals: 0, highest: 0, highestNotOut: false,
        bowlingInnings: 0, legalBalls: 0, conceded: 0, wickets: 0, catches: 0, stumpings: 0
      });
      return season.players.get(identifier);
    }
    for (const name of match.info.players[team]) {
      const record = player(name);
      if (!listed.has(record.id)) { record.matchListings++; listed.add(record.id); }
    }
    for (const innings of match.innings) {
      if (innings.super_over) continue;
      const batting = innings.team === team;
      const inningsBatters = new Map();
      const inningsBowlers = new Set();
      for (const over of innings.overs) {
        for (const ball of over.deliveries) {
          const extras = ball.extras || {};
          if (batting) {
            for (const name of [ball.batter, ball.non_striker]) {
              if (!inningsBatters.has(name)) inningsBatters.set(name, { runs: 0, dismissed: false });
            }
            const batter = player(ball.batter);
            batter.runs += ball.runs.batter;
            if (!extras.wides) batter.ballsFaced++;
            if (ball.runs.batter === 4 && !ball.runs.non_boundary) batter.fours++;
            if (ball.runs.batter === 6 && !ball.runs.non_boundary) batter.sixes++;
            inningsBatters.get(ball.batter).runs += ball.runs.batter;
          } else {
            const bowler = player(ball.bowler);
            inningsBowlers.add(ball.bowler);
            if (!extras.wides && !extras.noballs) bowler.legalBalls++;
            bowler.conceded += ball.runs.total - (extras.byes || 0) - (extras.legbyes || 0) - (extras.penalty || 0);
          }
          for (const wicket of ball.wickets || []) {
            if (batting && wicket.kind !== 'retired hurt') {
              const dismissed = player(wicket.player_out);
              dismissed.dismissals++;
              if (!inningsBatters.has(wicket.player_out)) inningsBatters.set(wicket.player_out, { runs: 0, dismissed: true });
              inningsBatters.get(wicket.player_out).dismissed = true;
            }
            if (!batting) {
              if (!nonBowlerDismissals.has(wicket.kind)) player(ball.bowler).wickets++;
              for (const fielder of wicket.fielders || []) {
                if (!match.info.players[team].includes(fielder.name) && !identities[fielder.name]) continue;
                if (['caught', 'caught and bowled'].includes(wicket.kind)) player(fielder.name).catches++;
                if (wicket.kind === 'stumped') player(fielder.name).stumpings++;
              }
              if (wicket.kind === 'caught and bowled' && !wicket.fielders?.length) player(ball.bowler).catches++;
            }
          }
        }
      }
      for (const [name, inningsRecord] of inningsBatters) {
        const record = player(name);
        record.battingInnings++;
        if (inningsRecord.runs > record.highest || (inningsRecord.runs === record.highest && !inningsRecord.dismissed)) {
          record.highest = inningsRecord.runs;
          record.highestNotOut = !inningsRecord.dismissed;
        }
      }
      for (const name of inningsBowlers) player(name).bowlingInnings++;
    }
  }
  return [...seasons.values()].sort((a, b) => a.year - b.year).map(season => ({
    ...season,
    players: [...season.players.values()].map(player => ({
      ...player,
      strikeRate: player.ballsFaced ? Number((player.runs / player.ballsFaced * 100).toFixed(2)) : null,
      average: player.dismissals ? Number((player.runs / player.dismissals).toFixed(2)) : null,
      economy: player.legalBalls ? Number((player.conceded / player.legalBalls * 6).toFixed(2)) : null,
      overs: `${Math.floor(player.legalBalls / 6)}.${player.legalBalls % 6}`
    })).sort((a, b) => b.runs - a.runs || b.wickets - a.wickets || a.name.localeCompare(b.name))
  }));
}
