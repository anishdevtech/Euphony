export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail: string;
}

export interface VideoInfo {
  id: string;
  title: string;
  author: string;
  duration: number;
  thumbnails: any[];
  description: string;
  viewCount: string;
}

export interface Playlist {
  title: string;
  description: string;
  trackCount: number;
  thumbnails: any[];
  tracks: Song[];
}

export interface Album {
  title: string;
  artist: string;
  year: string;
  trackCount: number;
  thumbnails: any[];
  tracks: Song[];
}

export interface StreamFormat {
  itag: number;
  mimeType: string;
  bitrate: number;
  audioQuality: string;
}

export interface StreamResponse {
  url: string;
  format: StreamFormat;
}