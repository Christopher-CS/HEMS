using UnityEngine;
using System;

public class DeviceStates
{
    public bool powerOn = false;

    public string systemMode = "TV";
    public int volume = 10;
    public bool muted = false;

    public TvState  tv = new TvState();
    public  GamingState gaming = new GamingState();

    public string playbackStatus = "stopped";
    public string artworkUrl = "";
    public string audioUrl = "";
    public float playbackPosition = 0f;
    public int currentChannel = 4;


}

[Serializable]
public class TvState
{
    public string selectedApp = "";
}

[Serializable]
public class GamingState
{
    public string selectedConsole = "Standard";
    public string selectedGame = "Halo";

}



