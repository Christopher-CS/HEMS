using UnityEngine;
using UnityEngine.Video;

public class SystemController : MonoBehaviour
{
    public DeviceStates currentState = new DeviceStates();
    public ScreenController screen;

    private VideoPlayer _videoPlayer;
    private AudioSource _tvAudioSource;
    private bool _vpRouted = false;

    void Start()
    {
        _videoPlayer = GetComponentInChildren<VideoPlayer>(true);
        if (_videoPlayer == null)
            _videoPlayer = GetComponentInParent<VideoPlayer>();
        if (_videoPlayer == null)
            _videoPlayer = FindAnyObjectByType<VideoPlayer>(FindObjectsInactive.Include);

        if (_videoPlayer == null)
        {
            Debug.LogWarning("[TV] No VideoPlayer found — volume control unavailable.");
            return;
        }

        // Create a dedicated AudioSource so VP audio doesn't share with the speaker system.
        var tvAudioGO = new GameObject("TV_Audio");
        tvAudioGO.transform.SetParent(_videoPlayer.transform);
        _tvAudioSource = tvAudioGO.AddComponent<AudioSource>();
        _tvAudioSource.playOnAwake = false;
        _tvAudioSource.volume = 0f;

        // VP may be on a disabled GameObject (screen off). Route it now only if
        // it's already active; otherwise RoutAndPlayVideoPlayer() is called when
        // the TV powers on and the screen becomes active.
        if (_videoPlayer.gameObject.activeInHierarchy)
            RouteAndPlayVideoPlayer();

        LogAllAudioSources();
    }

    void RouteAndPlayVideoPlayer()
    {
        if (_vpRouted) return;
        if (_videoPlayer == null || !_videoPlayer.gameObject.activeInHierarchy) return;

        _vpRouted = true;

        Debug.Log("[TV] Routing VideoPlayer → TV_Audio and preparing...");
        _videoPlayer.Stop();
        _videoPlayer.audioOutputMode = VideoAudioOutputMode.AudioSource;
        _videoPlayer.SetTargetAudioSource(0, _tvAudioSource);
        _videoPlayer.prepareCompleted += OnVideoPrepared;
        _videoPlayer.Prepare();
    }

    void OnVideoPrepared(VideoPlayer vp)
    {
        vp.prepareCompleted -= OnVideoPrepared;
        vp.Play();

        // Log routed VP
        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"outputMode={vp.audioOutputMode}  tracks={vp.audioTrackCount}");
        for (ushort t = 0; t < vp.audioTrackCount; t++)
        {
            var target = vp.GetTargetAudioSource(t);
            sb.AppendLine($"  track {t} → {(target != null ? $"'{target.gameObject.name}'" : "null")}");
        }
        Debug.Log($"[TV] ===== VP PREPARED (routed VP) =====\n{sb}");

        // Log every VideoPlayer separately so it's easy to spot
        var allVPs = FindObjectsByType<VideoPlayer>(FindObjectsInactive.Include, FindObjectsSortMode.None);
        var vpSb = new System.Text.StringBuilder();
        vpSb.AppendLine($"TOTAL VideoPlayers found: {allVPs.Length}");
        foreach (var v in allVPs)
            vpSb.AppendLine($"  GameObject='{v.gameObject.name}'  outputMode={v.audioOutputMode}  isPlaying={v.isPlaying}  isPrepared={v.isPrepared}");
        Debug.Log($"[TV] ===== ALL VIDEO PLAYERS IN SCENE =====\n{vpSb}");
    }

    void LogAllAudioSources()
    {
        var all = FindObjectsByType<AudioSource>(FindObjectsInactive.Include, FindObjectsSortMode.None);
        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"[TV] Found {all.Length} AudioSource(s) in scene:");
        foreach (var src in all)
        {
            string clip    = src.clip != null ? src.clip.name : "none";
            string vpTrack = "—";
            if (_videoPlayer != null)
            {
                for (ushort t = 0; t < _videoPlayer.audioTrackCount; t++)
                {
                    if (_videoPlayer.GetTargetAudioSource(t) == src)
                    {
                        vpTrack = $"VP track {t}";
                        break;
                    }
                }
            }
            sb.AppendLine($"  GO='{src.gameObject.name}'  clip={clip}  vol={src.volume:F2}  mute={src.mute}  playOnAwake={src.playOnAwake}  isPlaying={src.isPlaying}  vpTarget={vpTrack}");
        }
        Debug.Log(sb.ToString());
    }

    public void ApplyState(DeviceStates newState)
    {
        currentState = newState;
        Debug.Log("State updated too " + newState.ToString());
    }

    public void SetPower(bool on)
    {
        if (currentState.powerOn != on) TogglePower();
    }

    public void TogglePower()
    {
        currentState.powerOn = !currentState.powerOn;
        Debug.Log("Power: " + currentState.powerOn);
        screen.SetScreenActive(currentState.powerOn);
        if (currentState.powerOn)
        {
            screen.SetText("TV on");
            RefreshScreen();
        }
        else
        {
            screen.SetText("");
            _vpRouted = false; // Allow re-routing on next power-on
        }
    }

    public void SetVolume(int newVolume)
    {
        currentState.volume = Mathf.Clamp(newVolume, 0, 100);
        float normalised = currentState.volume / 100f;

        if (_videoPlayer == null)
        {
            Debug.LogWarning($"[TV] SetVolume({newVolume}) called but VideoPlayer is null");
            return;
        }

        switch (_videoPlayer.audioOutputMode)
        {
            case VideoAudioOutputMode.Direct:
            case VideoAudioOutputMode.APIOnly:
                for (ushort i = 0; i < _videoPlayer.audioTrackCount; i++)
                    _videoPlayer.SetDirectAudioVolume(i, normalised);
                break;

            case VideoAudioOutputMode.AudioSource:
                if (_tvAudioSource == null) { Debug.LogWarning("[TV] SetVolume: _tvAudioSource is null"); break; }
                _tvAudioSource.mute   = normalised <= 0f;
                _tvAudioSource.volume = Mathf.Clamp01(normalised);
                Debug.Log($"[TV] SetVolume({newVolume}) → AudioSource.volume={_tvAudioSource.volume:F2}  mute={_tvAudioSource.mute}");
                break;
        }
    }

    public void SetMute(bool mute)
    {
        if (_tvAudioSource == null) return;
        _tvAudioSource.mute = mute;
    }

    public void SetMode(string mode)
    {
        if (currentState.systemMode == mode) return;
        currentState.systemMode = mode;
        RefreshScreen();
    }

    public void SetTVApp(string appName)
    {
        if (currentState.tv.selectedApp == appName) return;
        currentState.tv.selectedApp = appName;
        RefreshScreen();
    }

    public void SetConsole(string consoleName)
    {
        if (currentState.gaming.selectedConsole == consoleName) return;
        currentState.gaming.selectedConsole = consoleName;
        RefreshScreen();
    }

    public void SetChannel(int channelNumber)
    {
        int safe = Mathf.Clamp(channelNumber, 1, 999);
        if (currentState.currentChannel == safe) return;

        string message;
        if (safe > currentState.currentChannel)
            message = $"Channel Up  {safe}";
        else if (safe < currentState.currentChannel)
            message = $"Channel Down  {safe}";
        else
            message = $"Channel {safe}";

        currentState.currentChannel = safe;

        if (currentState.powerOn)
            screen.ShowChannelToast(message);
    }

    public void RefreshScreen()
    {
        bool showingPanel = false;

        if (!currentState.powerOn)
        {
            screen.PowerOff();
            return;
        }

        if (currentState.playbackStatus == "playing" && !string.IsNullOrEmpty(currentState.artworkUrl))
        {
            screen.ShowArtwork(currentState.artworkUrl);
            return;
        }

        if (currentState.systemMode == "TV")
        {
            if (currentState.tv.selectedApp == "Netflix")
            {
                screen.ShowNetflix();
                showingPanel = true;
            }
            else if (currentState.tv.selectedApp == "Prime Video")
            {
                screen.ShowPrime();
                showingPanel = true;
            }
            else if (currentState.tv.selectedApp == "Peacock")
            {
                screen.ShowPeacock();
                showingPanel = true;
            }
            else if (currentState.tv.selectedApp == "Disney")
            {
                screen.ShowDisney();
                showingPanel = true;
            }
            else
            {
                screen.ShowPoweredOn();
            }
        }
        else if (currentState.systemMode == "Gaming")
        {
            if (currentState.gaming.selectedConsole == "Xbox")
            {
                screen.ShowXbox();
                showingPanel = true;
            }
            else if (currentState.gaming.selectedConsole == "PlayStation")
            {
                screen.ShowPlayStation();
                showingPanel = true;
            }
            else if (currentState.gaming.selectedConsole == "Switch")
            {
                screen.ShowSwitch();
                showingPanel = true;
            }
            else
            {
                screen.ShowPoweredOn();
            }
        }
        else
        {
            screen.ShowPoweredOn();
        }

        if (showingPanel && !_vpRouted && _videoPlayer != null && _videoPlayer.gameObject.activeInHierarchy)
        {
            RouteAndPlayVideoPlayer();
        }
    }

    
}
