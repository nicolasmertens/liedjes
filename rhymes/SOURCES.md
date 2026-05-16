# Audio sources — rhymes/

Each tile uses the first ~28 seconds (intro + first verse) of a YouTube
nursery-rhyme video, downloaded via `yt-dlp` and re-encoded to 96 kbps mono mp3.

| # | Rhyme                          | Channel              | YouTube ID     | Duration (orig) |
|---|--------------------------------|----------------------|----------------|-----------------|
| 01 | Twinkle, Twinkle, Little Star  | Super Simple Songs   | yCjJyiqpAuU    | 154 s           |
| 02 | Hey Diddle Diddle              | Sesame Street        | caRuhprYlOQ    |  57 s           |
| 03 | Hickory Dickory Dock           | Super Simple Songs   | HGgsklW-mtg    | 182 s           |
| 04 | Mary Had a Little Lamb         | Super Simple Songs   | YE7PiTwhTQk    | 176 s           |
| 05 | Humpty Dumpty                  | Super Simple Songs   | nrv495corBc    |  79 s           |
| 06 | The Itsy Bitsy Spider          | Twinkle Little Songs | w_lCi8U49mY    | 117 s           |
| 07 | Jack and Jill                  | Super Simple Songs   | EFj0K38sPmA    | 107 s           |
| 08 | Little Bo-Peep                 | Super Simple TV      | L8yYxqUvBKA    | 115 s           |
| 09 | There Was an Old Woman         | Little Baby Bum      | M3z5DeFQXgg    | 118 s           |
| 10 | This Little Piggy              | Bounce Patrol        | 5bdTKxLAoos    | 119 s           |

Re-download all tracks: `bash /tmp/liedjes_rhymes/yt_download.sh` (script
preserved on maxbook). Adjust `trim_start` / `trim_dur` per track in the
`TRACKS` array to change which 28-second window is used.

These are commercial recordings used here for a single child's home tablet.
Repo is public for telemetry tooling convenience — if redistribution becomes
a concern, either flip the repo to private (GitHub Pages still works on
private repos with Pro) or replace with public-domain renditions.
