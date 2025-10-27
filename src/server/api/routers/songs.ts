import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import * as cheerio from "cheerio";

const songInputSchema = z.object({
  title: z.string().min(1),
  lyrics: z.string().min(1),
  genre: z.string().min(1),
  key: z.string().optional(),
  notes: z.string().optional(),
  favorite: z.boolean().optional(),
  harmonica: z.enum(["C-F-B", "B-Es-As", "A-D-G"]).optional(),
  bas_bariton: z.string().optional(),
});

// Helper function to fetch and extract lyrics from a URL
async function fetchAndExtractLyrics(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: controller.signal
  });

  clearTimeout(timeout);

  if (!response.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to fetch lyrics page: ${response.status} ${response.statusText}`,
    });
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove scripts, styles, and other non-content elements
  $('script, style, nav, header, footer, aside, .sponsored, .advertisement, .sponsor').remove();

  // Try to find lyrics in article or main content
  let lyrics = '';
  const mainContent = $('article, main, .content, .entry-content, .post-content, .song-content');

  if (mainContent.length) {
    lyrics = mainContent.first().text().trim();
  } else {
    // Find the largest text block that looks like lyrics
    let maxLength = 0;
    let bestText = '';

    $('*').each((_, el) => {
      const text = $(el).text().trim();
      const parentText = $(el).parent().text().trim();

      // Look for substantial text blocks that could be lyrics
      if (text.length > maxLength && text.length > 200 && text !== parentText) {
        // Basic validation: should contain some structure that looks like lyrics
        const lines = text.split('\n');
        if (lines.length > 3) {
          maxLength = text.length;
          bestText = text;
        }
      }
    });

    lyrics = bestText;
  }

  if (!lyrics || lyrics.length < 50) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Could not extract lyrics from the page. The page structure may have changed or lyrics may not be available.",
    });
  }

  // Clean up the lyrics text
  lyrics = lyrics
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/^[ \t]+/gm, '')
    .trim();

  return { lyrics };
}

export const songsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        genre: z.string().optional(),
        harmonica: z.string().optional(),
        favorite: z.boolean().optional(),
        sortBy: z.enum(["title", "createdAt", "favorite"]).optional(),
        order: z.enum(["asc", "desc"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input?.search) {
        where.title = { contains: input.search, mode: "insensitive" };
      }
      if (input?.genre) {
        where.genre = { contains: input.genre, mode: "insensitive" };
      }
      if (input?.harmonica) {
        where.harmonica = { contains: input.harmonica, mode: "insensitive" };
      }
      if (input?.favorite !== undefined) {
        where.favorite = input.favorite;
      }

      const orderBy: any = {};
      if (input?.sortBy) {
        orderBy[input.sortBy] = input?.order ?? "asc";
      } else {
        orderBy.title = "asc";
      }

      const songs = await ctx.prisma.song.findMany({
        where,
        orderBy,
      });

      return songs;
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const song = await ctx.prisma.song.findUnique({
        where: { id: input.id },
      });

      if (!song) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Song not found",
        });
      }

      return song;
    }),

  create: protectedProcedure
    .input(songInputSchema)
    .mutation(async ({ ctx, input }) => {
      const song = await ctx.prisma.song.create({
        data: input,
      });
      return song;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number() }).extend(songInputSchema.shape))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const song = await ctx.prisma.song.update({
        where: { id },
        data,
      });

      return song;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.song.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  toggleFavorite: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const song = await ctx.prisma.song.findUnique({
        where: { id: input.id },
      });

      if (!song) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Song not found",
        });
      }

      const updatedSong = await ctx.prisma.song.update({
        where: { id: input.id },
        data: { favorite: !song.favorite },
      });

      return updatedSong;
    }),

  searchSongs: publicProcedure
    .input(z.object({ 
      query: z.string().min(1)
    }))
    .query(async ({ input }) => {
      try {
        // Search for songs on besedilo.si
        const searchQuery = encodeURIComponent(input.query);
        const searchUrl = `https://www.besedilo.si/?s=${searchQuery}`;
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        if (!response.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to search on besedilo.si: ${response.status}`,
          });
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Find all links to song pages with their titles
        const searchResults: Array<{ title: string; artist: string; url: string }> = [];
        const seenUrls = new Set<string>();
        
        // Look for any href that contains a path with slashes (artist/song pattern)
        $('a').each((_, el) => {
          const href = $(el).attr('href') || '';
          
          // Skip external links, anchors, and non-song links
          if (href.startsWith('http') && !href.includes('besedilo.si')) return;
          if (href.startsWith('#') || href.startsWith('javascript:')) return;
          if (href === '/' || href.includes('/login') || href.includes('/search') || href.includes('/s=')) return;
          
          // Skip known non-song pages
          const skipUrls = ['/kontakt', '/o-portalu', '/lista-izvajalcev', '/top100', '/kontakt/', '/o-portalu/', '/lista-izvajalcev/', '/top100/'];
          if (skipUrls.some(skip => href.toLowerCase().includes(skip))) return;
          
          let fullPath = '';
          
          // If it's a full URL to besedilo.si
          if (href.startsWith('https://www.besedilo.si/') || href.startsWith('https://besedilo.si/')) {
            const path = href.replace(/https:\/\/www\.besedilo\.si/, '').replace(/https:\/\/besedilo\.si/, '');
            if (path.includes('/') && path.split('/').filter(s => s.length > 0).length >= 2) {
              fullPath = path;
            }
          } else if (href.startsWith('/')) {
            // If it's a relative path
            const segments = href.split('/').filter(s => s.length > 0);
            if (segments.length >= 2) {
              fullPath = href;
            }
          }
          
          // Only add if we found a valid path with exactly 2 segments (artist/song)
          if (fullPath && fullPath.split('/').filter(s => s.length > 0).length === 2) {
            // Parse the URL to extract artist and song title
            const segments = fullPath.split('/').filter(s => s.length > 0);
            
            // Construct the full URL
            const url = fullPath.startsWith('http') 
              ? fullPath 
              : `https://www.besedilo.si${fullPath.startsWith('/') ? fullPath : '/' + fullPath}`;
            
            // Only add unique URLs
            if (!seenUrls.has(url)) {
              seenUrls.add(url);
              
              // Extract artist and song title from URL segments
              // Format is usually: /artist-name/song-title
              const formatText = (text: string) => {
                return text
                  .replace(/-/g, ' ')
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
              };
              
              const artist = segments[0] ? formatText(segments[0]) : '';
              const songTitle = segments[1] ? formatText(segments[1]) : '';
              
              // Filter out obvious non-song URLs and artist pages
              const skipPatterns = ['login', 'register', 'kontakt', 'o-portalu', 'send', 'search', 'top100', 'avtorji', 'authors'];
              const secondSegment = segments[1].toLowerCase();
              
              // Skip if second segment is a known non-song page (like artist pages)
              if (skipPatterns.includes(secondSegment) || secondSegment === 'avtorji') {
                return;
              }
              
              if (artist && songTitle && !skipPatterns.includes(segments[0].toLowerCase())) {
                searchResults.push({
                  title: songTitle,
                  artist: artist,
                  url: url
                });
              }
            }
          }
        });
        
        // Deduplicate by URL and remove any duplicates
        const uniqueResults = Array.from(
          new Map(searchResults.map(r => [r.url, r])).values()
        );
        
        return uniqueResults.slice(0, 10); // Return top 10 results
        
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to search for songs: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  scrapeLyrics: publicProcedure
    .input(z.object({ 
      title: z.string().optional(), 
      url: z.string().optional() 
    }))
    .query(async ({ input }) => {
      try {
        // If user provided a URL, use it directly
        if (input.url) {
          return await fetchAndExtractLyrics(input.url);
        }
        
        // If no title provided, error
        if (!input.title || input.title.trim().length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Please provide a song title, lyrics snippet, or URL",
          });
        }
        
        // Search for the song on besedilo.si
        // Note: This works for song titles, artist names, or even lyrics snippets
        // if the website indexes lyrics content
        const searchQuery = encodeURIComponent(input.title);
        const searchUrl = `https://www.besedilo.si/?s=${searchQuery}`;
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        if (!response.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to search on besedilo.si: ${response.status}`,
          });
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Find all links to song pages
        const songLinks: string[] = [];
        
        // Look for any href that contains a path with slashes (artist/song pattern)
        $('a').each((_, el) => {
          const href = $(el).attr('href') || '';
          
          // Skip external links, anchors, and non-song links
          if (href.startsWith('http') && !href.includes('besedilo.si')) return;
          if (href.startsWith('#') || href.startsWith('javascript:')) return;
          if (href === '/' || href.includes('/login') || href.includes('/search')) return;
          
          // If it's a full URL to besedilo.si
          if (href.startsWith('https://www.besedilo.si/') || href.startsWith('https://besedilo.si/')) {
            const path = href.replace('https://www.besedilo.si', '').replace('https://besedilo.si', '');
            if (path.includes('/') && path.split('/').filter(s => s.length > 0).length >= 2) {
              if (!songLinks.includes(path)) {
                songLinks.push(path);
              }
            }
            return;
          }
          
          // If it's a relative path
          if (href.startsWith('/')) {
            const segments = href.split('/').filter(s => s.length > 0);
            if (segments.length >= 2) {
              if (!songLinks.includes(href)) {
                songLinks.push(href);
              }
            }
          }
        });
        
        console.log('Found song links:', songLinks.slice(0, 3)); // Debug log
        
        if (songLinks.length === 0) {
          // Provide helpful suggestions when no results found
          const searchTerm = input.title;
          let suggestions = '';
          
          // Check if the search might be a lyrics snippet (longer text)
          if (searchTerm.length > 20) {
            suggestions = '\n\n💡 Tip: Searching by lyrics snippets may not always work. Try:\n- Using the exact song title\n- Using the artist name\n- Or visit besedilo.si directly and paste the URL here';
          } else {
            suggestions = '\n\n💡 Tip: Try:\n- Searching on besedilo.si yourself\n- Copy the song page URL\n- Paste it into the URL field above';
          }
          
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No results found for "${searchTerm}" on besedilo.si.${suggestions}`,
          });
        }
        
        // Use the first result
        const firstResultPath = songLinks[0];
        const fullUrl = firstResultPath.startsWith('http') 
          ? firstResultPath 
          : `https://www.besedilo.si${firstResultPath.startsWith('/') ? firstResultPath : '/' + firstResultPath}`;
        
        console.log('Scraping from URL:', fullUrl); // Debug log
        
        // Fetch and extract lyrics from the first result
        return await fetchAndExtractLyrics(fullUrl);
        
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to scrape lyrics: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),
});



