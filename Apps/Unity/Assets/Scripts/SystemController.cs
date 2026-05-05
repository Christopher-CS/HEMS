using UnityEngine;

public class SystemController : MonoBehaviour
{
    public DeviceStates currentState = new DeviceStates();
    public ScreenController screen;

    public void ApplyState(DeviceStates newState)
    {
        currentState = newState;
        Debug.Log("State updated too " + newState.ToString());
    }

    public void TogglePower()
    {
        currentState.powerOn = !currentState.powerOn;
        Debug.Log("Power: " + currentState.powerOn);
        screen.SetScreenActive(currentState.powerOn);
        if (currentState.powerOn)
        {
            screen.SetText("TV on");
        }
        else
        {
            screen.SetText("");
        }
    }

    public void SetVolume(int newVolume)
    {
        currentState.volume = newVolume;
        Debug.Log("Volume set to " + currentState.volume);
    }

    public void SetMode(string mode)
    {
        currentState.systemMode = mode;
        RefreshScreen();
    }

    public void SetTVApp(string appName)
    {
        currentState.tv.selectedApp = appName;
        RefreshScreen();
    }

    public void SetConsole(string consoleName)
    {
        currentState.gaming.selectedConsole = consoleName;
        RefreshScreen();
    }

    public void RefreshScreen()
    {
        if (!currentState.powerOn)
        {
            screen.PowerOff();
            return;
        }

        if (currentState.systemMode == "TV")
        {
            if (currentState.tv.selectedApp == "Netflix")
                screen.ShowNetflix();
            else if (currentState.tv.selectedApp == "Prime Video")
                screen.ShowPrime();
            else if (currentState.tv.selectedApp == "Peacock")
                screen.ShowPeacock();
            else if (currentState.tv.selectedApp == "Disney")
                screen.ShowDisney();
        }
        else if (currentState.systemMode == "Gaming")
        {
            if (currentState.gaming.selectedConsole == "Xbox")
                screen.ShowXbox();
            else if (currentState.gaming.selectedConsole == "PlayStation")
                screen.ShowPlayStation();
            else if (currentState.gaming.selectedConsole == "Switch")
                screen.ShowSwitch();
        }
    }

    
}
