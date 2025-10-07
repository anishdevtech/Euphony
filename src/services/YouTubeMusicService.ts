import { Song, VideoInfo, StreamResponse } from "../types/music";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

interface Credentials {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}

class YouTubeMusicService {
    // private readonly INNERTUBE_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
    private credentials: Credentials | null = null;
    private isAuthenticated: boolean = false;

    constructor() {
        this.loadCredentials();
    }

    /**
     * Load saved credentials from storage
     */
    private async loadCredentials() {
        try {
            const saved = await AsyncStorage.getItem("youtube_credentials");
            if (saved) {
                this.credentials = JSON.parse(saved);
                this.isAuthenticated = true;
                console.log("✅ Loaded saved credentials");

                // Check if token needs refresh
                if (
                    this.credentials &&
                    this.credentials.expires_at < Date.now()
                ) {
                    await this.refreshAccessToken();
                }
            }
        } catch (error) {
            console.error("Failed to load credentials:", error);
        }
    }

    /**
     * Save credentials to storage
     */
    private async saveCredentials(credentials: Credentials) {
        try {
            await AsyncStorage.setItem(
                "youtube_credentials",
                JSON.stringify(credentials)
            );
            this.credentials = credentials;
            this.isAuthenticated = true;
            console.log("💾 Credentials saved");
        } catch (error) {
            console.error("Failed to save credentials:", error);
        }
    }

    /**
     * Login with OAuth2 (TV Device Flow)
     */
    async login(): Promise<{ code: string; verificationUrl: string }> {
        try {
            console.log("🔐 Starting OAuth login...");

            // Request device code
            const response = await fetch(
                "https://oauth2.googleapis.com/device/code",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({
                        client_id:
                            "861556708454-d6dlm3lh05idd8npek18k6be8ba3oc68.apps.googleusercontent.com",
                        scope: "https://www.googleapis.com/auth/youtube"
                    }).toString()
                }
            );

            const data = await response.json();

            console.log("📱 Device code received");
            console.log("Verification URL:", data.verification_url);
            console.log("User Code:", data.user_code);

            // Start polling for token
            this.pollForToken(data.device_code, data.interval || 5);

            return {
                code: data.user_code,
                verificationUrl: data.verification_url
            };
        } catch (error) {
            console.error("Login failed:", error);
            throw new Error("Failed to initiate login");
        }
    }

    /**
     * Poll for access token after user authorizes
     */
    private async pollForToken(deviceCode: string, interval: number) {
        const poll = async () => {
            try {
                const response = await fetch(
                    "https://oauth2.googleapis.com/token",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        body: new URLSearchParams({
                            client_id:
                                "861556708454-d6dlm3lh05idd8npek18k6be8ba3oc68.apps.googleusercontent.com",
                            client_secret: "SboVhoG9s0rNafixCSGGKXAT",
                            device_code: deviceCode,
                            grant_type:
                                "urn:ietf:params:oauth:grant-type:device_code"
                        }).toString()
                    }
                );

                const data = await response.json();

                if (data.access_token) {
                    // Success!
                    console.log("✅ Login successful!");

                    const credentials: Credentials = {
                        access_token: data.access_token,
                        refresh_token: data.refresh_token,
                        expires_at: Date.now() + data.expires_in * 1000
                    };

                    await this.saveCredentials(credentials);
                    return;
                }

                if (data.error === "authorization_pending") {
                    // User hasn't authorized yet, keep polling
                    setTimeout(poll, interval * 1000);
                } else if (data.error === "slow_down") {
                    // Polling too fast, increase interval
                    setTimeout(poll, (interval + 5) * 1000);
                } else {
                    console.error("Token error:", data.error);
                }
            } catch (error) {
                console.error("Poll error:", error);
                setTimeout(poll, interval * 1000);
            }
        };

        poll();
    }

    /**
     * Refresh access token
     */
    private async refreshAccessToken() {
        if (!this.credentials?.refresh_token) {
            throw new Error("No refresh token available");
        }

        try {
            console.log("🔄 Refreshing access token...");

            const response = await fetch(
                "https://oauth2.googleapis.com/token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({
                        client_id:
                            "861556708454-d6dlm3lh05idd8npek18k6be8ba3oc68.apps.googleusercontent.com",
                        client_secret: "SboVhoG9s0rNafixCSGGKXAT",
                        refresh_token: this.credentials.refresh_token,
                        grant_type: "refresh_token"
                    }).toString()
                }
            );

            const data = await response.json();

            if (data.access_token) {
                const credentials: Credentials = {
                    access_token: data.access_token,
                    refresh_token: this.credentials.refresh_token,
                    expires_at: Date.now() + data.expires_in * 1000
                };

                await this.saveCredentials(credentials);
                console.log("✅ Token refreshed");
            }
        } catch (error) {
            console.error("Failed to refresh token:", error);
            throw error;
        }
    }

    /**
     * Logout and clear credentials
     */
    async logout() {
        await AsyncStorage.removeItem("youtube_credentials");
        this.credentials = null;
        this.isAuthenticated = false;
        console.log("👋 Logged out");
    }

    /**
     * Check if user is authenticated
     */
    isLoggedIn(): boolean {
        return this.isAuthenticated;
    }

    /**
     * Get authorization headers
     */
    /**
     * Get authorization headers
     */
    private async getAuthHeaders() {
        if (!this.credentials) {
            return {};
        }

        // Check if token expired
        if (this.credentials.expires_at < Date.now()) {
            await this.refreshAccessToken();
        }

        // YouTube API expects the token in a specific format
        return {
            Authorization: `Bearer ${this.credentials.access_token}`,
            "X-Goog-AuthUser": "0"
        };
    }

    async searchSongs(query: string): Promise<Song[]> {
        try {
            console.log("🔍 Searching for:", query);

            const response = await fetch(
                "https://music.youtube.com/youtubei/v1/search?prettyPrint=false",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "X-YouTube-Client-Name": "67",
                        "X-YouTube-Client-Version": "1.20231219.01.00",
                        Origin: "https://music.youtube.com",
                        Referer: "https://music.youtube.com/"
                    },
                    body: JSON.stringify({
                        context: {
                            client: {
                                clientName: "WEB_REMIX",
                                clientVersion: "1.20231219.01.00",
                                hl: "en",
                                gl: "US",
                                userAgent:
                                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                            }
                        },
                        query: query
                    })
                }
            );

            const data = await response.json();

            if (data.error) {
                console.error(
                    "❌ API Error:",
                    JSON.stringify(data.error, null, 2)
                );
                return [];
            }

            console.log("Response keys:", Object.keys(data));

            const songs: Song[] = [];
            const contents =
                data.contents?.tabbedSearchResultsRenderer?.tabs?.[0]
                    ?.tabRenderer?.content?.sectionListRenderer?.contents || [];

            console.log("Contents sections:", contents.length);

            for (const section of contents) {
                const items = section.musicShelfRenderer?.contents || [];
                console.log("Section items:", items.length);

                for (const item of items) {
                    const renderer = item.musicResponsiveListItemRenderer;
                    if (!renderer) continue;

                    const videoId =
                        renderer.playlistItemData?.videoId ||
                        renderer.overlay?.musicItemThumbnailOverlayRenderer
                            ?.content?.musicPlayButtonRenderer
                            ?.playNavigationEndpoint?.watchEndpoint?.videoId;

                    if (!videoId) continue;

                    const title =
                        renderer.flexColumns?.[0]
                            ?.musicResponsiveListItemFlexColumnRenderer?.text
                            ?.runs?.[0]?.text || "Unknown";

                    const artist =
                        renderer.flexColumns?.[1]
                            ?.musicResponsiveListItemFlexColumnRenderer?.text
                            ?.runs?.[0]?.text || "Unknown";

                    const duration =
                        renderer.flexColumns?.[1]
                            ?.musicResponsiveListItemFlexColumnRenderer?.text
                            ?.runs?.[4]?.text || "";

                    const thumbnail =
                        renderer.thumbnail?.musicThumbnailRenderer?.thumbnail
                            ?.thumbnails?.[0]?.url || "";

                    console.log("✅ Found:", title);

                    songs.push({
                        id: videoId,
                        title,
                        artist,
                        duration,
                        thumbnail: thumbnail.startsWith("//")
                            ? `https:${thumbnail}`
                            : thumbnail
                    });
                }
            }

            console.log(`✅ Total found: ${songs.length} songs`);
            return songs;
        } catch (error) {
            console.error("Search failed:", error);
            return [];
        }
    }

    async getVideoInfo(videoId: string): Promise<VideoInfo> {
        try {
            const authHeaders = await this.getAuthHeaders();

            const response = await fetch(
                `https://www.youtube.com/youtubei/v1/player?key=${this.INNERTUBE_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent":
                            "com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip",
                        ...authHeaders
                    },
                    body: JSON.stringify({
                        context: {
                            client: {
                                clientName: "ANDROID_MUSIC",
                                clientVersion: "6.42.52",
                                androidSdkVersion: 30
                            }
                        },
                        videoId: videoId
                    })
                }
            );

            const data = await response.json();
            const details = data.videoDetails;

            return {
                id: videoId,
                title: details.title,
                author: details.author,
                duration: parseInt(details.lengthSeconds),
                thumbnails: details.thumbnail.thumbnails,
                description: details.shortDescription || "",
                viewCount: details.viewCount
            };
        } catch (error) {
            console.error("Failed to get video info:", error);
            throw new Error("Failed to get video info");
        }
    }

    /**
     * Get audio stream with authentication
     */
async getAudioStream(videoId: string): Promise<StreamResponse> {
  try {
    console.log(`Getting audio for: ${videoId}`);

    // Get fresh credentials
    if (this.credentials && this.credentials.expires_at < Date.now()) {
      await this.refreshAccessToken();
    }

    const accessToken = this.credentials?.access_token;
    console.log('Has access token:', !!accessToken);
    
    const response = await fetch(
      'https://www.youtube.com/youtubei/v1/player',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip',
          'X-YouTube-Client-Name': '21',
          'X-YouTube-Client-Version': '6.42.52',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'ANDROID_MUSIC',
              clientVersion: '6.42.52',
              androidSdkVersion: 30,
              hl: 'en',
              gl: 'US',
            },
          },
          videoId: videoId,
          contentCheckOk: true,
          racyCheckOk: true,
        }),
      }
    );

    const data = await response.json();

    console.log('Response keys:', Object.keys(data));
    console.log('Playability status:', data.playabilityStatus?.status);

    if (data.error) {
      console.error('API Error:', data.error);
      // Try without auth
      console.log('Retrying without auth...');
      return await this.getAudioStreamNoAuth(videoId);
    }

    if (data.playabilityStatus?.status === 'UNPLAYABLE') {
      throw new Error(data.playabilityStatus.reason || 'Video unplayable');
    }

    if (data.playabilityStatus?.status === 'LOGIN_REQUIRED') {
      throw new Error('Please login to play this video');
    }

    if (!data.streamingData) {
      console.log('No streaming data, trying without auth...');
      return await this.getAudioStreamNoAuth(videoId);
    }

    let formats = data.streamingData.adaptiveFormats || [];
    
    if (formats.length === 0) {
      formats = data.streamingData.formats || [];
    }

    const audioFormats = formats.filter((f: any) => {
      const hasAudio = f.mimeType?.includes('audio') || f.audioQuality;
      const notVideo = !f.qualityLabel;
      return hasAudio && notVideo;
    });

    if (audioFormats.length === 0) {
      const anyAudioFormat = formats.find((f: any) => f.audioQuality);
      if (anyAudioFormat) {
        return {
          url: anyAudioFormat.url,
          format: {
            itag: anyAudioFormat.itag,
            mimeType: anyAudioFormat.mimeType,
            bitrate: anyAudioFormat.bitrate || anyAudioFormat.averageBitrate || 0,
            audioQuality: anyAudioFormat.audioQuality || 'AUDIO_QUALITY_MEDIUM',
          },
        };
      }
      
      throw new Error('No audio formats available');
    }

    const bestAudio = audioFormats.sort((a: any, b: any) => {
      const aBitrate = a.bitrate || a.averageBitrate || 0;
      const bBitrate = b.bitrate || b.averageBitrate || 0;
      return bBitrate - aBitrate;
    })[0];

    console.log('✅ Got audio URL');

    return {
      url: bestAudio.url,
      format: {
        itag: bestAudio.itag,
        mimeType: bestAudio.mimeType,
        bitrate: bestAudio.bitrate || bestAudio.averageBitrate || 0,
        audioQuality: bestAudio.audioQuality || 'AUDIO_QUALITY_MEDIUM',
      },
    };
  } catch (error) {
    console.error('Failed to get audio stream:', error);
    throw error;
  }
}

/**
 * Get audio without authentication (for public videos)
 */
private async getAudioStreamNoAuth(videoId: string): Promise<StreamResponse> {
  try {
    console.log('Getting audio WITHOUT auth...');
    
    const response = await fetch(
      'https://www.youtube.com/youtubei/v1/player',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip',
          'X-YouTube-Client-Name': '3',
          'X-YouTube-Client-Version': '19.09.37',
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'ANDROID',
              clientVersion: '19.09.37',
              androidSdkVersion: 30,
              hl: 'en',
              gl: 'US',
            },
          },
          videoId: videoId,
          contentCheckOk: true,
          racyCheckOk: true,
        }),
      }
    );

    const data = await response.json();
    
    console.log('No-auth response - playability:', data.playabilityStatus?.status);
    console.log('No-auth response - has streaming:', !!data.streamingData);

    if (!data.streamingData) {
      throw new Error('No streaming data available even without auth');
    }

    let formats = data.streamingData.adaptiveFormats || data.streamingData.formats || [];
    
    const audioFormats = formats.filter((f: any) => 
      (f.mimeType?.includes('audio') || f.audioQuality) && !f.qualityLabel
    );

    if (audioFormats.length === 0) {
      throw new Error('No audio formats available');
    }

    const bestAudio = audioFormats.sort((a: any, b: any) => 
      ((b.bitrate || b.averageBitrate || 0) - (a.bitrate || a.averageBitrate || 0))
    )[0];

    console.log('✅ Got audio URL without auth');

    return {
      url: bestAudio.url,
      format: {
        itag: bestAudio.itag,
        mimeType: bestAudio.mimeType,
        bitrate: bestAudio.bitrate || bestAudio.averageBitrate || 0,
        audioQuality: bestAudio.audioQuality || 'AUDIO_QUALITY_MEDIUM',
      },
    };
  } catch (error) {
    console.error('No-auth method failed:', error);
    throw error;
  }
}
    /**
     * Fallback: Try with iOS client
     */
    private async getAudioStreamIOS(videoId: string): Promise<StreamResponse> {
        try {
            console.log("Trying iOS client...");

            const authHeaders = await this.getAuthHeaders();

            const response = await fetch(
                "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent":
                            "com.google.ios.youtube/19.09.3 (iPhone14,3; U; CPU iOS 15_6 like Mac OS X)",
                        "X-YouTube-Client-Name": "5",
                        "X-YouTube-Client-Version": "19.09.3",
                        ...authHeaders
                    },
                    body: JSON.stringify({
                        context: {
                            client: {
                                clientName: "IOS",
                                clientVersion: "19.09.3",
                                deviceModel: "iPhone14,3",
                                hl: "en",
                                gl: "US"
                            }
                        },
                        videoId: videoId,
                        contentCheckOk: true,
                        racyCheckOk: true
                    })
                }
            );

            const data = await response.json();

            console.log(
                "iOS response - has streamingData:",
                !!data.streamingData
            );
            console.log("iOS playability:", data.playabilityStatus?.status);

            if (!data.streamingData) {
                throw new Error("No streaming data from iOS client either");
            }

            let formats =
                data.streamingData.adaptiveFormats ||
                data.streamingData.formats ||
                [];

            const audioFormats = formats.filter(
                (f: any) =>
                    (f.mimeType?.includes("audio") || f.audioQuality) &&
                    !f.qualityLabel
            );

            if (audioFormats.length === 0) {
                throw new Error("No audio formats from iOS client");
            }

            const bestAudio = audioFormats.sort(
                (a: any, b: any) =>
                    (b.bitrate || b.averageBitrate || 0) -
                    (a.bitrate || a.averageBitrate || 0)
            )[0];

            console.log("✅ Got audio URL from iOS client");

            return {
                url: bestAudio.url,
                format: {
                    itag: bestAudio.itag,
                    mimeType: bestAudio.mimeType,
                    bitrate: bestAudio.bitrate || bestAudio.averageBitrate || 0,
                    audioQuality:
                        bestAudio.audioQuality || "AUDIO_QUALITY_MEDIUM"
                }
            };
        } catch (error) {
            console.error("iOS client failed:", error);
            throw error;
        }
    }

    async getStreamUrl(videoId: string): Promise<StreamResponse> {
        return this.getAudioStream(videoId);
    }

    // ... rest of methods (getPlaylist, getSuggestions, etc.) remain the same
    async getPlaylist(playlistId: string): Promise<any> {
        try {
            const authHeaders = await this.getAuthHeaders();

            const response = await fetch(
                `https://music.youtube.com/youtubei/v1/browse?key=${this.INNERTUBE_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...authHeaders
                    },
                    body: JSON.stringify({
                        context: {
                            client: {
                                clientName: "WEB_REMIX",
                                clientVersion: "1.20220404.01.00"
                            }
                        },
                        browseId: `VL${playlistId}`
                    })
                }
            );

            const data = await response.json();

            const header = data.header?.musicDetailHeaderRenderer;
            const contents =
                data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]
                    ?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]
                    ?.musicPlaylistShelfRenderer?.contents || [];

            const tracks: Song[] = contents.map((item: any) => {
                const renderer = item.musicResponsiveListItemRenderer;
                return {
                    id: renderer.playlistItemData?.videoId || "",
                    title:
                        renderer.flexColumns?.[0]
                            ?.musicResponsiveListItemFlexColumnRenderer?.text
                            ?.runs?.[0]?.text || "Unknown",
                    artist:
                        renderer.flexColumns?.[1]
                            ?.musicResponsiveListItemFlexColumnRenderer?.text
                            ?.runs?.[0]?.text || "Unknown",
                    duration:
                        renderer.flexColumns?.[1]
                            ?.musicResponsiveListItemFlexColumnRenderer?.text
                            ?.runs?.[4]?.text || "",
                    thumbnail:
                        renderer.thumbnail?.musicThumbnailRenderer?.thumbnail
                            ?.thumbnails?.[0]?.url || ""
                };
            });

            return {
                title: header?.title?.runs?.[0]?.text || "Unknown",
                description: header?.description?.runs?.[0]?.text || "",
                trackCount: contents.length,
                thumbnails:
                    header?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail
                        ?.thumbnails || [],
                tracks
            };
        } catch (error) {
            console.error("Failed to get playlist:", error);
            throw new Error("Failed to get playlist");
        }
    }

    async getSuggestions(query: string): Promise<string[]> {
        try {
            const response = await fetch(
                `https://suggestqueries.google.com/complete/search?client=youtube&q=${encodeURIComponent(
                    query
                )}&ds=yt`
            );

            const text = await response.text();
            const json = JSON.parse(
                text.replace("window.google.ac.h(", "").replace(")", "")
            );

            return json[1].map((item: any) => item[0]);
        } catch (error) {
            console.error("Failed to get suggestions:", error);
            return [];
        }
    }

    async getRelatedVideos(videoId: string): Promise<Song[]> {
        try {
            const authHeaders = await this.getAuthHeaders();

            const response = await fetch(
                `https://www.youtube.com/youtubei/v1/next?key=${this.INNERTUBE_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...authHeaders
                    },
                    body: JSON.stringify({
                        context: {
                            client: {
                                clientName: "WEB",
                                clientVersion: "2.20220411.01.00"
                            }
                        },
                        videoId: videoId
                    })
                }
            );

            const data = await response.json();

            const results =
                data.contents?.singleColumnWatchNextResults?.results?.results
                    ?.contents || [];
            const related: Song[] = [];

            for (const item of results) {
                const renderer = item.compactVideoRenderer;
                if (!renderer) continue;

                related.push({
                    id: renderer.videoId,
                    title: renderer.title?.simpleText || "Unknown",
                    artist:
                        renderer.longBylineText?.runs?.[0]?.text || "Unknown",
                    duration: renderer.lengthText?.simpleText || "",
                    thumbnail: renderer.thumbnail?.thumbnails?.[0]?.url || ""
                });
            }

            return related;
        } catch (error) {
            console.error("Failed to get related videos:", error);
            return [];
        }
    }

    async getHomeFeed(): Promise<any[]> {
        try {
            const authHeaders = await this.getAuthHeaders();

            const response = await fetch(
                `https://music.youtube.com/youtubei/v1/browse?key=${this.INNERTUBE_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...authHeaders
                    },
                    body: JSON.stringify({
                        context: {
                            client: {
                                clientName: "WEB_REMIX",
                                clientVersion: "1.20220404.01.00"
                            }
                        },
                        browseId: "FEmusic_home"
                    })
                }
            );

            const data = await response.json();
            return (
                data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]
                    ?.tabRenderer?.content?.sectionListRenderer?.contents || []
            );
        } catch (error) {
            console.error("Failed to get home feed:", error);
            return [];
        }
    }
}

export default new YouTubeMusicService();
