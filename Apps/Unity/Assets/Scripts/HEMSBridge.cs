using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using UnityEngine;
using UnityEngine.Networking;

/// <summary>
/// On Start: fetches the current device states from the backend over HTTP
/// and applies them to the scene, then keeps the scene in sync via WebSocket.
///
/// Setup:
///   1. Attach to any persistent GameObject.
///   2. Assign LightController, SpeakerController, SystemController in Inspector.
///   3. Set Backend Url (default: http://localhost:4000).
///      The WebSocket URL is derived automatically (http→ws).
/// </summary>
public class HEMSBridge : MonoBehaviour
{
    [Header("Backend")]
    public string backendUrl = "http://192.168.1.72:4000";

    [Header("Scene Controllers")]
    public LightController lightController;
    public SpeakerController speakerController;
    public SystemController systemController;

    private ClientWebSocket _ws;
    private CancellationTokenSource _cts;
    private Thread _receiveThread;
    private readonly ConcurrentQueue<string> _queue = new ConcurrentQueue<string>();
    // Slugs that have received a live WS update; HTTP initial state is skipped for these.
    private readonly HashSet<string> _liveUpdated = new HashSet<string>();

    void Start()
    {
        StartCoroutine(FetchInitialState());
        ConnectWebSocket();
    }

    // ── Initial state ─────────────────────────────────────────────────────

    IEnumerator FetchInitialState()
    {
        using var req = UnityWebRequest.Get($"{backendUrl}/api/devices");
        yield return req.SendWebRequest();

        if (req.result != UnityWebRequest.Result.Success)
        {
            Debug.LogWarning($"[HEMS] Could not fetch initial state: {req.error}");
            yield break;
        }

        var response = JsonUtility.FromJson<DeviceListResponse>(req.downloadHandler.text);
        if (response?.devices == null) yield break;

        foreach (var device in response.devices)
        {
            // Skip if a live WebSocket update already arrived for this slug.
            if (_liveUpdated.Contains(device.slug)) continue;

            var msg = new DeviceStateMsg
            {
                slug           = device.slug,
                powerState     = device.powerState,
                levelCurrent   = device.level.current,
                colorMode      = device.colorState.mode,
                colorHue       = device.colorState.hue,
                colorSaturation= device.colorState.saturation,
                colorKelvin    = device.colorState.kelvin > 0 ? device.colorState.kelvin : 4000f,
                modeCurrent    = device.mode.current,
                playbackStatus = device.playbackState.status,
                playbackMuted  = device.playbackState.isMuted,
                playbackPosition = device.playbackState.position,
                artworkUrl     = device.playbackState.nowPlaying != null ? device.playbackState.nowPlaying.artworkUrl : "",
                audioUrl       = ResolveMediaUrl(device.playbackState.nowPlaying != null ? device.playbackState.nowPlaying.audioUrl : ""),
                consoleApp     = device.consoleState.currentApp,
                currentChannel = device.navigationState != null && device.navigationState.currentChannel > 0
                    ? device.navigationState.currentChannel
                    : 4,
            };
            ApplyMsg(msg);
        }

        Debug.Log("[HEMS] Initial state applied");
    }

    // ── WebSocket ─────────────────────────────────────────────────────────

    void ConnectWebSocket()
    {
        var wsUrl = backendUrl.Replace("http://", "ws://").Replace("https://", "wss://");
        _cts = new CancellationTokenSource();
        _ws  = new ClientWebSocket();

        _ws.ConnectAsync(new Uri(wsUrl), _cts.Token)
            .ContinueWith(task =>
            {
                if (task.IsFaulted)
                {
                    Debug.LogError($"[HEMS] WebSocket connect failed: {task.Exception?.InnerException?.Message}");
                    return;
                }
                Debug.Log($"[HEMS] WebSocket connected to {wsUrl}");
                _receiveThread = new Thread(ReceiveLoop) { IsBackground = true };
                _receiveThread.Start();
            });
    }

    void ReceiveLoop()
    {
        var buffer = new byte[8192];
        while (!_cts.IsCancellationRequested && _ws.State == WebSocketState.Open)
        {
            try
            {
                var result = _ws.ReceiveAsync(new ArraySegment<byte>(buffer), _cts.Token)
                                .GetAwaiter().GetResult();

                if (result.MessageType == WebSocketMessageType.Text)
                    _queue.Enqueue(Encoding.UTF8.GetString(buffer, 0, result.Count));
                else if (result.MessageType == WebSocketMessageType.Close)
                    break;
            }
            catch { break; }
        }
        Debug.Log("[HEMS] Receive loop ended");
    }

    void Update()
    {
        while (_queue.TryDequeue(out var msg))
        {
            try
            {
                var parsed = JsonUtility.FromJson<DeviceStateMsg>(msg);
                if (parsed != null && !string.IsNullOrEmpty(parsed.slug))
                {
                    parsed.audioUrl = ResolveMediaUrl(parsed.audioUrl);
                    _liveUpdated.Add(parsed.slug);
                    ApplyMsg(parsed);
                }
            }
            catch (Exception e)
            {
                Debug.LogWarning($"[HEMS] Bad message: {e.Message}");
            }
        }
    }

    // ── Apply to scene ────────────────────────────────────────────────────

    void ApplyMsg(DeviceStateMsg msg)
    {
        switch (msg.slug)
        {
            case "ambiance":       ApplyLight(msg);  break;
            case "sound-system":   ApplyAudio(msg);  break;
            case "living-room-tv": ApplyTV(msg);     break;
        }
    }

    void ApplyLight(DeviceStateMsg msg)
    {
        lightController.SetPower(msg.powerState == "on");
        lightController.SetBrightness(msg.levelCurrent / 100f);

        if (msg.colorMode == "color")
            lightController.SetColor(Color.HSVToRGB(msg.colorHue / 360f, msg.colorSaturation / 100f, 1f));
        else
            lightController.SetColor(KelvinToColor(msg.colorKelvin));
    }

    void ApplyAudio(DeviceStateMsg msg)
    {
        if (msg.powerState != "on")
        {
            speakerController.StopAudio();
            speakerController.SetMute(true);
            return;
        }

        speakerController.SetVolume(msg.levelCurrent / 100f);
        speakerController.SetMute(msg.playbackMuted);

        if (msg.playbackStatus == "playing")
            speakerController.PlayAudio();
        else
            speakerController.StopAudio();
    }

    void ApplyTV(DeviceStateMsg msg)
    {
        if (!string.IsNullOrWhiteSpace(msg.audioUrl))
        {
            Debug.Log(
                $"[HEMS] TV playback update status={msg.playbackStatus} position={msg.playbackPosition} audioUrl={msg.audioUrl}"
            );
        }

        speakerController.SetVolume(msg.levelCurrent / 100f);
        speakerController.SetMute(msg.playbackMuted);
        speakerController.SyncPlayback(msg.audioUrl, msg.playbackStatus, msg.playbackPosition);

        systemController.SetPower(msg.powerState == "on");
        systemController.SetVolume(Mathf.RoundToInt(msg.levelCurrent));
        systemController.SetMute(msg.playbackMuted);

        if (!string.IsNullOrEmpty(msg.modeCurrent))
            systemController.SetMode(msg.modeCurrent);

        var mode = !string.IsNullOrEmpty(msg.modeCurrent)
            ? msg.modeCurrent
            : systemController.currentState.systemMode;

        if (mode == "Gaming")
        {
            systemController.SetConsole(msg.consoleApp ?? "");
            systemController.SetTVApp("");
        }
        else
        {
            systemController.SetTVApp(msg.consoleApp ?? "");
            systemController.SetConsole("");
        }
        systemController.currentState.artworkUrl = msg.artworkUrl;
        systemController.currentState.audioUrl = msg.audioUrl;
        systemController.currentState.playbackStatus = msg.playbackStatus;
        systemController.currentState.playbackPosition = msg.playbackPosition;
        systemController.SetChannel(msg.currentChannel);
        systemController.RefreshScreen();
    }

    string ResolveMediaUrl(string mediaUrl)
    {
        if (string.IsNullOrWhiteSpace(mediaUrl)) return "";
        if (mediaUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            mediaUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            return mediaUrl;
        if (mediaUrl.StartsWith("/"))
            return $"{backendUrl.TrimEnd('/')}{mediaUrl}";
        return $"{backendUrl.TrimEnd('/')}/{mediaUrl}";
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    static Color KelvinToColor(float kelvin)
    {
        float t = Mathf.Clamp01((kelvin - 2700f) / (6500f - 2700f));
        return Color.Lerp(new Color(1f, 0.6f, 0.2f), new Color(0.9f, 0.95f, 1f), t);
    }

    void OnDestroy()
    {
        _cts?.Cancel();
        if (_ws?.State == WebSocketState.Open)
            _ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "Bye", CancellationToken.None);
        _receiveThread?.Join(500);
    }
}

// ── WebSocket message (flat, matches backend broadcast) ───────────────────

[Serializable]
class DeviceStateMsg
{
    public string slug;
    public string powerState;
    public float  levelCurrent;
    public string colorMode;
    public float  colorHue;
    public float  colorSaturation;
    public float  colorKelvin;
    public string modeCurrent;
    public string playbackStatus;
    public bool   playbackMuted;
    public float  playbackPosition;
    public string artworkUrl;
    public string audioUrl;
    public string consoleApp;
    public int currentChannel;
}

// ── HTTP response types (GET /api/devices) ────────────────────────────────

[Serializable]
class DeviceListResponse
{
    public bool        success;
    public DeviceDoc[] devices;
}

[Serializable]
class DeviceDoc
{
    public string          slug;
    public string          powerState;
    public LevelDoc        level;
    public ColorStateDoc   colorState;
    public ModeDoc         mode;
    public PlaybackDoc     playbackState;
    public ConsoleStateDoc consoleState;
    public NavigationStateDoc navigationState;
}

[Serializable] class LevelDoc        { public float  current; }
[Serializable] class ColorStateDoc   { public string mode; public float kelvin; public float hue; public float saturation; }
[Serializable] class ModeDoc         { public string current; }
[Serializable] class PlaybackDoc     { public string status; public bool isMuted; public float position; public NowPlayingDoc nowPlaying; }
[Serializable] class NowPlayingDoc   { public string artworkUrl; public string audioUrl; }
[Serializable] class ConsoleStateDoc { public string currentApp; }
[Serializable] class NavigationStateDoc { public int currentChannel; }
