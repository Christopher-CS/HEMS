using UnityEngine;

public class LightController : MonoBehaviour
{
    public Light[] lights;

    // Optional: assign the bulb/fixture mesh renderers so their emission
    // tints to match the current color and dims with brightness.
    public Renderer[] emissionRenderers;

    [Range(0f, 1f)]
    public float brightness = 1f;

    public bool lightsOn = true;

    public Color currentColor = Color.white;

    [SerializeField] private float maxIntensity = 5f;
    [SerializeField] private float maxEmissionIntensity = 2f;

    public void SetPower(bool on)
    {
        lightsOn = on;
        foreach (var light in lights)
            if (light != null) light.enabled = on;
        UpdateEmission();
    }

    public void TogglePower()
    {
        SetPower(!lightsOn);
    }

    public void SetBrightness(float value)
    {
        brightness = Mathf.Clamp01(value);
        foreach (var light in lights)
            if (light != null) light.intensity = brightness * maxIntensity;
        UpdateEmission();
    }

    public void SetColor(Color newColor)
    {
        currentColor = newColor;
        foreach (var light in lights)
            if (light != null) light.color = currentColor;
        UpdateEmission();
    }

    public void SetColorfromHex(string hex)
    {
        if (ColorUtility.TryParseHtmlString(hex, out Color parsed))
            SetColor(parsed);
        else
            Debug.LogWarning($"[Light] Invalid hex color: {hex}");
    }

    public void ApplyState(bool on, float newBrightness, string hexColor)
    {
        SetPower(on);
        SetBrightness(newBrightness);
        SetColorfromHex(hexColor);
    }

    // Updates the emission color on any assigned mesh renderers so the
    // bulb/fixture physically reflects the current color and brightness.
    private void UpdateEmission()
    {
        if (emissionRenderers == null) return;
        float intensity = lightsOn ? brightness * maxEmissionIntensity : 0f;
        Color emissionColor = currentColor * intensity;

        var block = new MaterialPropertyBlock();
        foreach (var r in emissionRenderers)
        {
            if (r == null) continue;
            r.GetPropertyBlock(block);
            block.SetColor("_EmissionColor", emissionColor);
            r.SetPropertyBlock(block);
        }
    }
}
