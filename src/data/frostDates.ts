// Frost date lookup by US ZIP code prefix.
// Data source: NOAA 1991-2020 Climate Normals (32°F / 50% probability threshold).
// Each entry: [zip3Min, zip3Max, lastSpringFrost "MM-DD", firstFallFrost "MM-DD"]
// null = essentially frost-free location.
// Lookup uses the first 3 digits of the ZIP as an integer (e.g. "10001" → 100).

type FrostEntry = [number, number, string | null, string | null]

const FROST_RANGES: FrostEntry[] = [
  // Puerto Rico / USVI
  [0, 9, null, null],

  // Massachusetts
  [10, 12, '05-01', '10-01'],   // western MA (Berkshires, Springfield)
  [13, 19, '04-20', '10-15'],   // central/eastern MA (Worcester, Boston suburbs)
  [20, 27, '04-15', '10-20'],   // eastern MA coast (Boston, Cape Cod)

  // Rhode Island
  [28, 29, '04-15', '10-20'],

  // New Hampshire
  [30, 34, '05-20', '09-20'],   // NH (mostly rural/northern)
  [35, 38, '05-01', '10-01'],   // NH southern/coastal

  // Maine
  [40, 44, '05-25', '09-15'],   // ME northern
  [45, 49, '05-10', '09-25'],   // ME southern/coastal

  // Vermont
  [50, 54, '05-15', '09-25'],   // VT northern
  [55, 59, '05-10', '09-30'],   // VT southern/central

  // Connecticut
  [60, 69, '04-20', '10-20'],

  // New Jersey
  [70, 83, '04-15', '10-25'],   // NJ northern/central
  [84, 89, '04-01', '11-01'],   // NJ southern (Cape May area)

  // APO/FPO military — no data
  // 090-098 will fall through to null

  // New York
  [100, 104, '04-05', '11-05'], // NYC metro
  [105, 119, '04-15', '10-20'], // NY suburbs, Westchester, Long Island
  [120, 129, '04-25', '10-15'], // Hudson Valley
  [130, 139, '05-05', '10-01'], // Syracuse / Utica
  [140, 149, '04-25', '10-20'], // Buffalo / western NY

  // Pennsylvania
  [150, 160, '04-20', '10-20'], // Pittsburgh / western PA
  [161, 169, '05-01', '10-01'], // PA central mountains
  [170, 179, '04-25', '10-10'], // Harrisburg / central PA
  [180, 189, '04-20', '10-15'], // Scranton / northeastern PA
  [190, 196, '04-05', '11-01'], // Philadelphia area

  // Delaware
  [197, 199, '04-10', '10-25'],

  // DC area
  [200, 205, '04-05', '11-01'],

  // Maryland
  [206, 214, '04-10', '10-25'], // Baltimore / suburban MD
  [215, 219, '04-20', '10-15'], // MD western mountains

  // Virginia
  [220, 229, '04-10', '10-25'], // VA northern / DC suburbs
  [230, 239, '03-25', '11-05'], // VA coastal / Richmond / Norfolk
  [240, 246, '04-25', '10-10'], // VA mountains / Roanoke / Blue Ridge

  // West Virginia
  [247, 268, '04-25', '10-10'],

  // North Carolina
  [270, 279, '04-01', '11-01'], // NC piedmont (Raleigh-Durham, Charlotte)
  [280, 289, '03-15', '11-20'], // NC coastal / eastern

  // South Carolina
  [290, 299, '03-15', '11-20'],

  // Georgia
  [300, 312, '03-20', '11-15'], // GA northern / Atlanta
  [313, 319, '03-01', '11-25'], // GA southern / coastal / Savannah

  // Florida
  [320, 322, '02-20', '12-05'], // FL northern (Jacksonville, Tallahassee)
  [323, 326, '02-01', '12-15'], // FL north-central
  [327, 349, null, null],        // FL central / south — frost-free

  // Alabama
  [350, 359, '03-15', '11-15'], // AL northern
  [360, 369, '03-01', '11-25'], // AL southern / Mobile

  // Tennessee
  [370, 374, '04-05', '10-25'], // TN eastern / Knoxville / mountains
  [375, 379, '03-25', '11-05'], // TN central / Nashville
  [380, 385, '03-20', '11-10'], // TN western / Memphis

  // Mississippi
  [386, 397, '03-10', '11-20'],

  // Kentucky
  [400, 409, '04-05', '10-25'], // KY central / Louisville
  [410, 418, '04-20', '10-10'], // KY eastern mountains
  [419, 427, '04-01', '10-30'], // KY western

  // Ohio
  [430, 439, '04-20', '10-20'],
  [440, 449, '04-25', '10-25'], // OH northern / Cleveland (lake effect)
  [450, 459, '04-20', '10-20'],

  // Indiana
  [460, 469, '04-25', '10-15'], // IN northern
  [470, 479, '04-10', '10-25'], // IN southern

  // Michigan
  [480, 489, '04-25', '10-20'], // MI southeastern / Detroit
  [490, 499, '05-20', '09-25'], // MI northern / Upper Peninsula

  // Iowa
  [500, 514, '05-01', '10-05'], // IA northern
  [515, 528, '04-20', '10-15'], // IA southern / Des Moines

  // Wisconsin
  [530, 539, '04-25', '10-15'], // WI southern / Milwaukee
  [540, 549, '05-15', '09-25'], // WI northern

  // Minnesota
  [550, 558, '05-01', '10-05'], // MN southern / Twin Cities
  [559, 567, '05-25', '09-15'], // MN northern (Duluth, Iron Range)

  // South Dakota
  [570, 577, '05-05', '09-25'],

  // North Dakota
  [580, 588, '05-15', '09-15'],

  // Montana
  [590, 599, '05-15', '09-15'], // MT (varies widely by elevation)

  // Illinois
  [600, 609, '04-25', '10-25'], // IL northern / Chicago
  [610, 629, '04-10', '10-25'], // IL central / southern

  // Missouri
  [630, 641, '04-05', '10-25'], // MO eastern / St. Louis
  [642, 658, '04-10', '10-20'], // MO western / Kansas City

  // Kansas
  [660, 669, '04-10', '10-25'], // KS eastern
  [670, 679, '04-20', '10-15'], // KS western

  // Nebraska
  [680, 689, '04-25', '10-10'], // NE eastern / Omaha
  [690, 693, '05-05', '09-25'], // NE western / panhandle

  // Louisiana
  [700, 708, '02-15', '12-10'], // LA southern / New Orleans
  [709, 714, '03-01', '11-25'], // LA northern / Shreveport

  // Arkansas
  [716, 729, '03-25', '11-10'],

  // Oklahoma
  [730, 740, '03-25', '11-10'], // OK central / eastern
  [741, 749, '04-05', '11-01'], // OK western / panhandle

  // Texas
  [750, 759, '03-10', '11-20'], // TX north / Dallas
  [760, 769, '03-15', '11-15'], // TX north-central / Fort Worth
  [770, 779, '02-10', '12-10'], // TX Houston / Gulf Coast
  [780, 789, '02-25', '12-01'], // TX San Antonio / south
  [790, 799, '04-01', '11-01'], // TX west / Panhandle (higher elevation)

  // Colorado
  [800, 816, '05-01', '10-01'], // CO Denver metro (mountains differ significantly)

  // Wyoming
  [820, 831, '05-20', '09-15'],

  // Idaho
  [832, 839, '05-10', '09-20'],

  // Utah
  [840, 847, '04-20', '10-20'], // UT Salt Lake City area

  // Arizona
  [850, 853, '03-01', '12-01'], // AZ Phoenix valley (frost rare)
  [854, 860, '04-01', '11-15'], // AZ Tucson / central
  [861, 865, '05-20', '09-20'], // AZ Flagstaff / high elevation

  // New Mexico
  [870, 875, '04-15', '11-01'], // NM Albuquerque / central
  [876, 884, '05-01', '10-10'], // NM northern mountains / Santa Fe

  // Nevada
  [885, 891, '05-10', '10-01'], // NV Reno / northern high desert
  [893, 898, '03-01', '12-01'], // NV Las Vegas (frost rare)

  // California
  [900, 908, '01-15', '12-20'], // CA Los Angeles metro
  [910, 912, null, null],        // CA San Diego coastal — frost-free
  [913, 916, '03-01', '11-30'], // CA Inland Empire / Riverside valleys
  [917, 919, '01-15', '12-20'], // CA Orange County
  [920, 921, null, null],        // CA San Diego — frost-free
  [922, 927, '03-01', '11-30'], // CA inland San Bernardino / Riverside
  [928, 929, '03-15', '11-15'], // CA desert (Palm Springs area)
  [930, 939, '03-01', '12-01'], // CA central coast (SLO, Santa Barbara)
  [940, 944, '03-01', '12-10'], // CA SF Bay Area
  [945, 958, '02-20', '12-05'], // CA Central Valley / Sacramento
  [959, 961, '04-01', '11-15'], // CA northern (Redding area)
  [962, 966, '04-15', '11-01'], // CA far north (Eureka / Humboldt)

  // Hawaii
  [967, 968, null, null],

  // Oregon
  [970, 975, '03-25', '11-10'], // OR western / Willamette Valley / Portland
  [976, 979, '05-01', '10-01'], // OR eastern (Bend, eastern OR much colder)

  // Washington
  [980, 986, '04-01', '11-01'], // WA western (Seattle, Tacoma, Olympia)
  [987, 994, '05-01', '10-01'], // WA eastern (Spokane, Yakima, Tri-Cities)

  // Alaska
  [995, 999, '05-20', '09-05'], // AK (Anchorage-area approximation; varies widely)
]

export interface FrostDates {
  lastFrost: string   // YYYY-MM-DD
  firstFrost: string  // YYYY-MM-DD
}

export function lookupFrostDates(zip: string): FrostDates | null {
  if (!/^\d{5}/.test(zip)) return null
  const prefix = parseInt(zip.slice(0, 3), 10)
  const year = new Date().getFullYear()

  for (const [min, max, last, first] of FROST_RANGES) {
    if (prefix >= min && prefix <= max) {
      if (!last || !first) return null
      return {
        lastFrost: `${year}-${last}`,
        firstFrost: `${year}-${first}`,
      }
    }
  }
  return null
}
