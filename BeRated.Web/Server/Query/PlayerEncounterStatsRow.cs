﻿using System;

namespace BeRated.Query
{
	class PlayerEncounterStatsRow
	{
		public int OpponentId { get; set; }
		public string OpponentName { get; set; }
		public int Kills { get; set; }
		public int Deaths { get; set; }
		public Decimal WinPercentage { get; set; }
	}
}