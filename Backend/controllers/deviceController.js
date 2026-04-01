import Device from '../models/Device'

const validateData = (data) => {
    if (data.capabilities.powerable && !data.powerState)
        throw new Error("Missing powerstate");
    if (data.capabilities.levelAdjustable && !data.level)
        throw new Error("Missing level");
    if (data.capabilities.modeSelectable && !data.mode)
        throw new Error("Missing modes");
    if (data.capabilities.moveable && !data.position)
        throw new Error("Missing position");
    if (data.capabilities.consoleControllable && !data.consoleState)
        throw new Error("Missing console state");
}

export const addDevice = async (req, res) => {
    try {
        const { userId } = req.auth()
        const deviceData = req.body

        validateData(deviceData)

        const device = new Device({
            ...deviceData,
            owner: userId
        })

        await device.save()

        res.json({ success: true, device })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }   
}