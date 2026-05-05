using UnityEngine;

public class LightController : MonoBehaviour
{
    public Light[] lights;

    [Range(0f, 10f)]
    public float brightness = 1f;

    public bool lightsOn = true;

    public Color currentColor = Color.white;

    [SerializeField] private float maxIntensity = 5f;

    public void SetPower(bool on)
    {
        lightsOn = on;

        foreach (Light light in lights)
        {
            if (light != null)
            {
                light.enabled = on;
            }
        }
    }

    public void TogglePower()
    {
        SetPower(!lightsOn);
    }

    public void SetBrightness(float value)
    {
        brightness = Mathf.Clamp01(value);
        foreach (Light light in lights)
        {
            if (light != null)
            {
                light.intensity = brightness * maxIntensity;
            }
        }
    }

    public void SetColor(Color newColor)
    {
        currentColor = newColor;

        foreach (Light light in lights)
        {
            if (light != null)
            {
                light.color = currentColor;
            }
        }
    }

    public void SetColorfromHex (string hex)
    {
        if (ColorUtility.TryParseHtmlString(hex, out Color parsedColor))
        {
            SetColor(parsedColor);
        }
        else
        {
            Debug.Log("Invalud hex color: " + hex);
        }
    }

    public void ApplyState(bool on, float Newbrightness, string hexColor)
    {
        SetPower(on);
        SetBrightness(Newbrightness);
        SetColorfromHex(hexColor);
    }
}
