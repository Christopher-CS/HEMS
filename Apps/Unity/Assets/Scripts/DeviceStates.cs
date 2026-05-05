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


}

[Serializable]
public class TvState
{
    
    public string selectedApp = "Netflix";
}

[Serializable]
public class GamingState
{
    public string selectedConsole = "Standard";
    public string selectedGame = "Halo";

}



