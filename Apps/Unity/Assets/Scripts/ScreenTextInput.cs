using UnityEngine;
using UnityEngine.UI;

public class ScreenTextInput : MonoBehaviour
{
   public ScreenController screen;
   public SystemController controller;

   public SpeakerController speakerController;

   public LightController lightController;

   private float currentBrightness = 1f;
   private int colorIndex = 0;
   public float currentVolume = 0.5f;

    private string[] testColors = {
        "#FFFFFF",
        "#FF0000",
        "#00FF00",
        "#0000FF",
        "#FFA500",
        "#8000FF"};
    // Update is called once per frame
    void Update()
    {
        if (Input.GetKeyDown(KeyCode.T))
        {
            controller.SetMode("TV");
        }
        if (Input.GetKeyDown(KeyCode.G))
        {
            controller.SetMode("Gaming");
        } 
        if (Input.GetKeyDown(KeyCode.Alpha1))
        {
            controller.SetTVApp("Netflix");

        }
        if (Input.GetKeyDown(KeyCode.Alpha2))
        {
            controller.SetTVApp("Prime Video");
        }
        if (Input.GetKeyDown(KeyCode.Alpha3))
        {
            controller.SetTVApp("Peacock");
        }
        if (Input.GetKeyDown(KeyCode.Alpha4))
        {
            controller.SetTVApp("Disney");
        }
        if (Input.GetKeyDown(KeyCode.X))
        {
            controller.SetConsole("Xbox");
        }
        if (Input.GetKeyDown(KeyCode.C))
        {
            controller.SetConsole("PlayStation");
        }
        if (Input.GetKeyDown(KeyCode.V))
        {
            controller.SetConsole("Switch");
        }
        if (Input.GetKeyDown(KeyCode.P))
        {
            controller.TogglePower();
        }
        if (Input.GetKeyDown(KeyCode.Space))
        {
            speakerController.PlayAudio();
        }
        if (Input.GetKeyDown(KeyCode.S))
        {
            speakerController.StopAudio();
        }
        if (Input.GetKeyDown(KeyCode.M))
        {
            speakerController.ToggleMute();
        }
        if (Input.GetKeyDown(KeyCode.UpArrow))
        {
            currentVolume += 0.1f;
            speakerController.SetVolume(currentVolume);
        }
        if (Input.GetKeyDown(KeyCode.DownArrow))
        {
            currentVolume -= 0.1f;
            speakerController.SetVolume(currentVolume);
        }
        if (Input.GetKeyDown(KeyCode.L))
        {
            lightController.TogglePower();
        }
        if (Input.GetKeyDown(KeyCode.W))
        {
            if (currentBrightness >= 1) return;
            currentBrightness += 0.1f;
            lightController.SetBrightness(currentBrightness);
        }
        if (Input.GetKeyDown(KeyCode.D))
        {
            if (currentBrightness <= 0) return;
            currentBrightness -= 0.1f;
            lightController.SetBrightness(currentBrightness);
        }
        if (Input.GetKeyDown(KeyCode.Z))
        {
            colorIndex++;
            if (colorIndex >= testColors.Length)
                colorIndex = 0;

            lightController.SetColorfromHex(testColors[colorIndex]);
        }
    }
}
