using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class SpeakerController : MonoBehaviour
{
    public AudioSource[] speakers;
    private const float StreamPlaybackGain = 0.31622776f; // -10 dB

    private AudioClip _currentClip;
    private string _currentAudioUrl = "";
    private Coroutine _loadCoroutine;
    private string _pendingPlaybackStatus = "stopped";
    private float _pendingPlaybackPosition = 0f;
    private string _lastAppliedStatus = "stopped";
    private float _lastAppliedPosition = 0f;

    private AudioSource PrimarySpeaker =>
        speakers != null && speakers.Length > 0 ? speakers[0] : null;

    void Awake()
    {
        if (speakers == null || speakers.Length == 0)
        {
            speakers = GetComponentsInChildren<AudioSource>(true);
            Debug.Log($"[SPEAKERS] Auto-discovered {speakers.Length} AudioSource(s).");
        }

        if (speakers == null || speakers.Length == 0)
        {
            Debug.LogWarning("[SPEAKERS] No AudioSources assigned or discovered. Audio playback cannot start.");
            return;
        }

        foreach (AudioSource speaker in speakers)
        {
            speaker.playOnAwake = false;
        }
    }

    public void SyncPlayback(string audioUrl, string playbackStatus, float positionSeconds)
    {
        if (speakers == null || speakers.Length == 0)
        {
            Debug.LogWarning("[SPEAKERS] SyncPlayback ignored because there are no speaker AudioSources.");
            return;
        }

        _pendingPlaybackStatus = playbackStatus ?? "stopped";
        _pendingPlaybackPosition = Mathf.Max(0f, positionSeconds);

        if (string.IsNullOrWhiteSpace(audioUrl))
        {
            if (_pendingPlaybackStatus == "stopped")
                StopAudio();
            return;
        }

        if (_currentClip == null || !string.Equals(_currentAudioUrl, audioUrl, StringComparison.Ordinal))
        {
            QueueClipLoad(audioUrl);
            return;
        }

        bool statusChanged = !string.Equals(_pendingPlaybackStatus, _lastAppliedStatus, StringComparison.Ordinal);
        bool positionChanged = Mathf.Abs(_pendingPlaybackPosition - _lastAppliedPosition) >= 1f;

        if (!statusChanged && !positionChanged)
            return;

        ApplyPlaybackState();
    }

    public void PlayAudio()
    {
        if (_currentClip == null)
        {
            Debug.LogWarning("[SPEAKERS] PlayAudio requested but no clip is loaded.");
            return;
        }

        foreach (AudioSource speaker in speakers)
        {
            if (speaker.clip == null) speaker.clip = _currentClip;
            if (!speaker.isPlaying) speaker.Play();
        }

        _lastAppliedStatus = "playing";
    }

    public void PauseAudio()
    {
        foreach (AudioSource speaker in speakers)
        {
            if (speaker.isPlaying) speaker.Pause();
        }

        _lastAppliedStatus = "paused";
    }

    public void StopAudio()
    {
        foreach (AudioSource speaker in speakers)
        {
            speaker.Stop();
            if (speaker.clip != null)
                speaker.time = 0f;
        }

        _lastAppliedStatus = "stopped";
        _lastAppliedPosition = 0f;
    }

    public void SetVolume(float volume)
    {
        float scaledVolume = Mathf.Clamp01(volume) * StreamPlaybackGain;
        foreach (AudioSource speaker in speakers)
        {
            speaker.volume = scaledVolume;
        }
    }

    public void SetMute(bool mute)
    {
        foreach (AudioSource speaker in speakers)
            speaker.mute = mute;
    }

    public void ToggleMute()
    {
        foreach (AudioSource speaker in speakers)
            speaker.mute = !speaker.mute;
    }

    private void QueueClipLoad(string audioUrl)
    {
        if (_loadCoroutine != null)
            StopCoroutine(_loadCoroutine);

        StopAudio();
        _loadCoroutine = StartCoroutine(LoadClip(audioUrl));
    }

    private IEnumerator LoadClip(string audioUrl)
    {
        AudioType audioType = InferAudioType(audioUrl);
        if (audioType == AudioType.UNKNOWN)
        {
            Debug.LogWarning($"[SPEAKERS] Unsupported audio type for URL: {audioUrl}");
            _loadCoroutine = null;
            yield break;
        }

        foreach (string requestUrl in BuildCandidateUrls(audioUrl))
        {
            Debug.Log($"[SPEAKERS] Loading clip from {requestUrl}");
            using UnityWebRequest req = UnityWebRequestMultimedia.GetAudioClip(requestUrl, audioType);
            yield return req.SendWebRequest();

            if (req.result != UnityWebRequest.Result.Success)
            {
                Debug.LogWarning($"[SPEAKERS] Failed to load clip from {requestUrl}: {req.error}");
                continue;
            }

            AudioClip clip = DownloadHandlerAudioClip.GetContent(req);
            if (clip == null)
            {
                Debug.LogWarning($"[SPEAKERS] Backend returned no audio clip for {requestUrl}");
                continue;
            }

            _loadCoroutine = null;
            _currentClip = clip;
            _currentAudioUrl = audioUrl;
            AssignClipToSpeakers(clip);

            Debug.Log($"[SPEAKERS] Loaded clip '{clip.name}' from {requestUrl}");
            ApplyPlaybackState();
            yield break;
        }

        _loadCoroutine = null;
    }

    private void ApplyPlaybackState()
    {
        switch (_pendingPlaybackStatus)
        {
            case "playing":
                if (Mathf.Abs(_pendingPlaybackPosition - _lastAppliedPosition) >= 1f)
                    SetPlaybackPosition(_pendingPlaybackPosition);
                PlayAudio();
                break;
            case "paused":
                SetPlaybackPosition(_pendingPlaybackPosition);
                PauseAudio();
                break;
            case "stopped":
                StopAudio();
                break;
            default:
                Debug.Log($"[SPEAKERS] Ignoring unsupported playback status '{_pendingPlaybackStatus}'");
                break;
        }
    }

    private void AssignClipToSpeakers(AudioClip clip)
    {
        foreach (AudioSource speaker in speakers)
        {
            speaker.clip = clip;
        }
    }

    private void SetPlaybackPosition(float positionSeconds)
    {
        if (_currentClip == null) return;

        float clamped = Mathf.Clamp(positionSeconds, 0f, Mathf.Max(0f, _currentClip.length - 0.05f));
        foreach (AudioSource speaker in speakers)
        {
            if (speaker.clip == null) continue;
            if (Mathf.Abs(speaker.time - clamped) >= 0.25f)
                speaker.time = clamped;
        }

        _lastAppliedPosition = clamped;
    }

    private static AudioType InferAudioType(string audioUrl)
    {
        string path = audioUrl;
        int queryIndex = path.IndexOf('?');
        if (queryIndex >= 0)
            path = path.Substring(0, queryIndex);

        string extension = System.IO.Path.GetExtension(path).ToLowerInvariant();
        return extension switch
        {
            ".mp3" => AudioType.MPEG,
            ".wav" => AudioType.WAV,
            ".ogg" => AudioType.OGGVORBIS,
            _ => AudioType.UNKNOWN,
        };
    }

    private static string EscapeMediaUrl(string audioUrl)
    {
        try
        {
            Uri uri = new Uri(audioUrl);
            string[] segments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < segments.Length; i++)
                segments[i] = Uri.EscapeDataString(Uri.UnescapeDataString(segments[i]));

            string escapedPath = "/" + string.Join("/", segments);
            string query = string.IsNullOrEmpty(uri.Query) ? "" : uri.Query;
            return $"{uri.Scheme}://{uri.Authority}{escapedPath}{query}";
        }
        catch
        {
            return audioUrl;
        }
    }

    private static string[] BuildCandidateUrls(string audioUrl)
    {
        string escapedOriginal = EscapeMediaUrl(audioUrl);

        try
        {
            Uri original = new Uri(escapedOriginal);
            string localPathAndQuery = $"{original.AbsolutePath}{original.Query}";
            string localhost = $"http://localhost:{original.Port}{localPathAndQuery}";
            string loopback = $"http://127.0.0.1:{original.Port}{localPathAndQuery}";

            if (
                original.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                original.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase)
            )
            {
                return new[] { escapedOriginal };
            }

            return new[] { escapedOriginal, localhost, loopback };
        }
        catch
        {
            return new[] { escapedOriginal };
        }
    }
}
