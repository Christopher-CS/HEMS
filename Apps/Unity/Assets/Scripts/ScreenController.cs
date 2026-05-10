using UnityEngine;
using TMPro;
using UnityEngine.UI;
using UnityEngine.Networking;
using System.Collections;

public class ScreenController : MonoBehaviour
{
    private const string DisplayPowerOff = "poweroff";
    private const string DisplayNetflix = "netflix";
    private const string DisplayPrime = "prime";
    private const string DisplayDisney = "disney";
    private const string DisplayPeacock = "peacock";
    private const string DisplayXbox = "xbox";
    private const string DisplayPlayStation = "playstation";
    private const string DisplaySwitch = "switch";
    private const string DisplayArtwork = "artwork";

    public TextMeshProUGUI screenText;
    public GameObject screenobject;
    public GameObject NetflixObject;
    public GameObject primeObject;
    public GameObject peacockObject;
    public GameObject DisneyObject;
    public GameObject XboxObject;
    public GameObject PlayStationObject;
    public GameObject SwitchObject;
    public RawImage artworkImage;
    private TextMeshProUGUI _toastText;
    private Coroutine _toastCoroutine;
    private string _currentArtworkUrl;
    private string _activeDisplay = "";

    public void SetText(string message)
    {
        screenText.text = message;
    }

    public void ShowChannelToast(string message)
    {
        EnsureToastText();
        if (_toastCoroutine != null) StopCoroutine(_toastCoroutine);
        _toastCoroutine = StartCoroutine(ShowChannelToastRoutine(message));
    }

    public void ShowPoweredOn()
    {
        if (_activeDisplay == "poweron" && screenText.gameObject.activeSelf) return;
        HideAllPanels();
        screenText.gameObject.SetActive(true);
        screenText.text = "TV On";
        _activeDisplay = "poweron";
    }

    public void PowerOff()
    {
        if (_activeDisplay == DisplayPowerOff && screenText.gameObject.activeSelf) return;
        HideAllPanels();
        screenText.gameObject.SetActive(true);
        screenText.text = "Power Off";
        _activeDisplay = DisplayPowerOff;
    }

    public void SetScreenActive(bool Active)
    {
        screenobject.SetActive(Active);
    }

    public void HideAllPanels()
    {
        screenText.gameObject.SetActive(false);

        NetflixObject.SetActive(false);
        primeObject.SetActive(false);
        peacockObject.SetActive(false);
        DisneyObject.SetActive(false);
        XboxObject.SetActive(false);
        PlayStationObject.SetActive(false);
        SwitchObject.SetActive(false);
        if (artworkImage != null) artworkImage.gameObject.SetActive(false);
        _activeDisplay = "";
    }

    public void ShowNetflix()
    {
        ShowPanel(NetflixObject, DisplayNetflix);
    }

    public void ShowPrime()
    {
        ShowPanel(primeObject, DisplayPrime);
    }

    public void ShowDisney()
    {
        ShowPanel(DisneyObject, DisplayDisney);
    }

    public void ShowPeacock()
    {
        ShowPanel(peacockObject, DisplayPeacock);
    }

    public void ShowXbox()
    {
        ShowPanel(XboxObject, DisplayXbox);
    }

    public void ShowPlayStation()
    {
        ShowPanel(PlayStationObject, DisplayPlayStation);
    }

    public void ShowSwitch()
    {
        ShowPanel(SwitchObject, DisplaySwitch);
    }

    public void ShowArtwork(string url)
    {
        if (
            _activeDisplay == DisplayArtwork &&
            _currentArtworkUrl == url &&
            artworkImage != null &&
            artworkImage.gameObject.activeSelf
        ) return;

        HideAllPanels();

        if (artworkImage == null)
        {
            GameObject go = new GameObject("ArtworkImage");
            go.transform.SetParent(NetflixObject.transform.parent, false);
            go.transform.SetAsLastSibling();
            artworkImage = go.AddComponent<RawImage>();
            RectTransform rt = go.GetComponent<RectTransform>();
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = Vector2.one;
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;

            // Match the Z offset of the other panels so it isn't hidden inside the TV model
            Vector3 pos = rt.localPosition;
            pos.z = NetflixObject.transform.localPosition.z;
            rt.localPosition = pos;
        }

        artworkImage.gameObject.SetActive(true);
        _currentArtworkUrl = url;
        _activeDisplay = DisplayArtwork;
        StartCoroutine(LoadImage(url));
    }

    private void ShowPanel(GameObject panel, string displayKey)
    {
        if (_activeDisplay == displayKey && panel.activeSelf) return;

        HideAllPanels();
        panel.SetActive(true);
        _activeDisplay = displayKey;
    }

    IEnumerator LoadImage(string url)
    {
        using (UnityWebRequest uwr = UnityWebRequestTexture.GetTexture(url))
        {
            yield return uwr.SendWebRequest();
            if (uwr.result != UnityWebRequest.Result.Success)
            {
                Debug.LogWarning($"[Screen] Failed to load artwork: {uwr.error}");
            }
            else
            {
                Texture2D texture = DownloadHandlerTexture.GetContent(uwr);
                if (artworkImage != null) artworkImage.texture = texture;
            }
        }
    }

    void EnsureToastText()
    {
        if (_toastText != null) return;

        var go = new GameObject("ScreenToastText");
        go.transform.SetParent(screenText.transform.parent, false);
        go.transform.SetAsLastSibling();
        _toastText = go.AddComponent<TextMeshProUGUI>();
        _toastText.font = screenText.font;
        _toastText.fontSharedMaterial = screenText.fontSharedMaterial;
        _toastText.enableWordWrapping = false;
        _toastText.fontSize = screenText.fontSize * 0.7f;
        _toastText.alignment = TextAlignmentOptions.TopRight;
        _toastText.color = Color.white;
        _toastText.text = "";
        _toastText.gameObject.SetActive(false);

        var rt = _toastText.rectTransform;
        var source = screenText.rectTransform;
        rt.localRotation = source.localRotation;
        rt.localScale = source.localScale;
        rt.anchorMin = new Vector2(0.30f, 0.78f);
        rt.anchorMax = new Vector2(0.70f, 0.94f);
        rt.pivot = source.pivot;
        rt.offsetMin = Vector2.zero;
        rt.offsetMax = Vector2.zero;
    }

    IEnumerator ShowChannelToastRoutine(string message)
    {
        _toastText.text = message;
        _toastText.gameObject.SetActive(true);
        yield return new WaitForSeconds(1.5f);
        if (_toastText != null) _toastText.gameObject.SetActive(false);
        _toastCoroutine = null;
    }

}
