using UnityEngine;
using TMPro;
public class ScreenController : MonoBehaviour
{
    public TextMeshProUGUI screenText;
    public GameObject screenobject;
    public GameObject NetflixObject;
    public GameObject primeObject;
    public GameObject peacockObject;
    public GameObject DisneyObject;
    public GameObject XboxObject;
    public GameObject PlayStationObject;
    public GameObject SwitchObject;

    public void SetText(string message)
    {
        screenText.text = message;
    }

    public void PowerOff()
    {
        HideAllPanels();
        screenText.gameObject.SetActive(true);
        screenText.text = "Power Off";
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
    }

    public void ShowNetflix()
    {
        HideAllPanels();
        NetflixObject.SetActive(true);

    }

    public void ShowPrime()
    {
        HideAllPanels();
        primeObject.SetActive(true);
    }

    public void ShowDisney()
    {
        HideAllPanels();
        DisneyObject.SetActive(true);
    }

    public void ShowPeacock()
    {
        HideAllPanels();
        peacockObject.SetActive(true);
    }

    public void ShowXbox()
    {
        HideAllPanels();
        XboxObject.SetActive(true);
    }

    public void ShowPlayStation()
    {
        HideAllPanels();
        PlayStationObject.SetActive(true);
    }

    public void ShowSwitch()
    {
        HideAllPanels();
        SwitchObject.SetActive(true);
    }

}
