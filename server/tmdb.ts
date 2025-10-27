
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface TMDBSearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
}

interface TMDBSearchResponse {
  results: TMDBSearchResult[];
}

export async function searchMoviePoster(movieTitle: string): Promise<string | undefined> {
  if (!TMDB_API_KEY) {
    console.warn('TMDB_API_KEY not set. Skipping poster fetch.');
    return undefined;
  }

  try {
    const cleanTitle = movieTitle
      .replace(/\b(19|20)\d{2}\b/g, '') // Remove years
      .replace(/\b(1080p|720p|480p|BluRay|WEB-DL|WEBRip|HDRip|BRRip|DVDRip|x264|x265|HEVC)\b/gi, '') // Remove quality tags
      .replace(/[._-]/g, ' ')
      .trim();

    const response = await axios.get<TMDBSearchResponse>(
      `${TMDB_BASE_URL}/search/movie`,
      {
        params: {
          api_key: TMDB_API_KEY,
          query: cleanTitle,
          language: 'en-US'
        }
      }
    );

    if (response.data.results && response.data.results.length > 0) {
      const posterPath = response.data.results[0].poster_path;
      return posterPath ? `${TMDB_IMAGE_BASE_URL}${posterPath}` : undefined;
    }
  } catch (error) {
    console.error(`Error fetching poster for "${movieTitle}":`, error);
  }

  return undefined;
}

export async function searchSeriesPoster(seriesTitle: string): Promise<string | undefined> {
  if (!TMDB_API_KEY) {
    console.warn('TMDB_API_KEY not set. Skipping poster fetch.');
    return undefined;
  }

  try {
    const cleanTitle = seriesTitle
      .replace(/\b(S\d{2}|Season\s*\d+)\b/gi, '') // Remove season indicators
      .replace(/[._-]/g, ' ')
      .trim();

    const response = await axios.get<TMDBSearchResponse>(
      `${TMDB_BASE_URL}/search/tv`,
      {
        params: {
          api_key: TMDB_API_KEY,
          query: cleanTitle,
          language: 'en-US'
        }
      }
    );

    if (response.data.results && response.data.results.length > 0) {
      const posterPath = response.data.results[0].poster_path;
      return posterPath ? `${TMDB_IMAGE_BASE_URL}${posterPath}` : undefined;
    }
  } catch (error) {
    console.error(`Error fetching poster for "${seriesTitle}":`, error);
  }

  return undefined;
}
