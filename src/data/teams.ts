export interface Team {
  id: string;
  name: string;
  flag: string; // Emoji
  iso: string; // ISO 3166-1 alpha-2 code
  continent: string;
}

export const TEAMS: Team[] = [
  // North America
  { id: "USA", name: "USA", flag: "🇺🇸", iso: "us", continent: "CONCACAF" },
  { id: "MEX", name: "Mexico", flag: "🇲🇽", iso: "mx", continent: "CONCACAF" },
  { id: "CAN", name: "Canada", flag: "🇨🇦", iso: "ca", continent: "CONCACAF" },
  { id: "CRC", name: "Costa Rica", flag: "🇨🇷", iso: "cr", continent: "CONCACAF" },
  { id: "PAN", name: "Panama", flag: "🇵🇦", iso: "pa", continent: "CONCACAF" },
  { id: "JAM", name: "Jamaica", flag: "🇯🇲", iso: "jm", continent: "CONCACAF" },
  
  // South America
  { id: "ARG", name: "Argentina", flag: "🇦🇷", iso: "ar", continent: "CONMEBOL" },
  { id: "BRA", name: "Brazil", flag: "🇧🇷", iso: "br", continent: "CONMEBOL" },
  { id: "URU", name: "Uruguay", flag: "🇺🇾", iso: "uy", continent: "CONMEBOL" },
  { id: "COL", name: "Colombia", flag: "🇨🇴", iso: "co", continent: "CONMEBOL" },
  { id: "ECU", name: "Ecuador", flag: "🇪🇨", iso: "ec", continent: "CONMEBOL" },
  { id: "PER", name: "Peru", flag: "🇵🇪", iso: "pe", continent: "CONMEBOL" },
  
  // Europe
  { id: "FRA", name: "France", flag: "🇫🇷", iso: "fr", continent: "UEFA" },
  { id: "ENG", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", iso: "gb-eng", continent: "UEFA" },
  { id: "ESP", name: "Spain", flag: "🇪🇸", iso: "es", continent: "UEFA" },
  { id: "GER", name: "Germany", flag: "🇩🇪", iso: "de", continent: "UEFA" },
  { id: "POR", name: "Portugal", flag: "🇵🇹", iso: "pt", continent: "UEFA" },
  { id: "NED", name: "Netherlands", flag: "🇳🇱", iso: "nl", continent: "UEFA" },
  { id: "BEL", name: "Belgium", flag: "🇧🇪", iso: "be", continent: "UEFA" },
  { id: "CRO", name: "Croatia", flag: "🇭🇷", iso: "hr", continent: "UEFA" },
  { id: "DEN", name: "Denmark", flag: "🇩🇰", iso: "dk", continent: "UEFA" },
  { id: "SUI", name: "Switzerland", flag: "🇨🇭", iso: "ch", continent: "UEFA" },
  { id: "AUT", name: "Austria", flag: "🇦🇹", iso: "at", continent: "UEFA" },
  { id: "TUR", name: "Turkey", flag: "🇹🇷", iso: "tr", continent: "UEFA" },
  { id: "POL", name: "Poland", flag: "🇵🇱", iso: "pl", continent: "UEFA" },
  { id: "GEO", name: "Georgia", flag: "🇬🇪", iso: "ge", continent: "UEFA" },
  
  // Africa
  { id: "MAR", name: "Morocco", flag: "🇲🇦", iso: "ma", continent: "CAF" },
  { id: "SEN", name: "Senegal", flag: "🇸🇳", iso: "sn", continent: "CAF" },
  { id: "NGA", name: "Nigeria", flag: "🇳🇬", iso: "ng", continent: "CAF" },
  { id: "EGY", name: "Egypt", flag: "🇪🇬", iso: "eg", continent: "CAF" },
  { id: "CIV", name: "Ivory Coast", flag: "🇨🇮", iso: "ci", continent: "CAF" },
  { id: "TUN", name: "Tunisia", flag: "🇹🇳", iso: "tn", continent: "CAF" },
  { id: "ALG", name: "Algeria", flag: "🇩🇿", iso: "dz", continent: "CAF" },
  { id: "GHA", name: "Ghana", flag: "🇬🇭", iso: "gh", continent: "CAF" },
  { id: "CMR", name: "Cameroon", flag: "🇨🇲", iso: "cm", continent: "CAF" },

  // Asia
  { id: "JPN", name: "Japan", flag: "🇯🇵", iso: "jp", continent: "AFC" },
  { id: "KOR", name: "South Korea", flag: "🇰🇷", iso: "kr", continent: "AFC" },
  { id: "AUS", name: "Australia", flag: "🇦🇺", iso: "au", continent: "AFC" },
  { id: "KSA", name: "Saudi Arabia", flag: "🇸🇦", iso: "sa", continent: "AFC" },
  { id: "IRN", name: "Iran", flag: "🇮🇷", iso: "ir", continent: "AFC" },
  { id: "IRQ", name: "Iraq", flag: "🇮🇶", iso: "iq", continent: "AFC" },
  { id: "UZB", name: "Uzbekistan", flag: "🇺🇿", iso: "uz", continent: "AFC" },
  { id: "QAT", name: "Qatar", flag: "🇶🇦", iso: "qa", continent: "AFC" },
  
  // Oceania
  { id: "NZL", name: "New Zealand", flag: "🇳🇿", iso: "nz", continent: "OFC" },
  { id: "HAI", name: "Haiti", flag: "🇭🇹", iso: "ht", continent: "CONCACAF" },
  
  // Rest
  { id: "UKR", name: "Ukraine", flag: "🇺🇦", iso: "ua", continent: "UEFA" },
  { id: "SCO", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", iso: "gb-sct", continent: "UEFA" },
  { id: "NOR", name: "Norway", flag: "🇳🇴", iso: "no", continent: "UEFA" },
  { id: "SWE", name: "Sweden", flag: "🇸🇪", iso: "se", continent: "UEFA" }
];
