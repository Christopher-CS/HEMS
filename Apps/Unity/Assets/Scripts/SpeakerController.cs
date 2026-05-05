using UnityEngine;

public class SpeakerController : MonoBehaviour
{
    public AudioSource[] speakers;

    public void PlayAudio()
    {
        foreach (AudioSource speaker in speakers)
        {
            speaker.Play();
        }
    }

    public void StopAudio()
    {
        foreach (AudioSource speaker in speakers)
        {
            speaker.Stop();
        }
    }

    public void SetVolume(float volume)
    {
        foreach (AudioSource speaker in speakers)
        {
            speaker.volume = Mathf.Clamp01(volume);
        }
    }

    public void ToggleMute()
    {
        foreach (AudioSource speaker in speakers)
        {
            speaker.mute = !speaker.mute;
        }
    }


}
