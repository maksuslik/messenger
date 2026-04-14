import * as sdk from 'matrix-js-sdk';

const client = sdk.createClient({
    baseUrl: "https://your-matrix-server.com",
    accessToken: "YOUR_ACCESS_TOKEN",
    userId: "YOUR_USER_ID",
    deviceId: "YOUR_DEVICE_ID",
});

await client.initRustCrypto();
client.startClient();

const roomId = await client.createRoom({
    invite: ["@user:server"],
    is_direct: true,
    preset: sdk.Preset.TrustedPrivateChat,
    initial_state: [
        {
            type: "m.room.encryption",
            state_key: "",
            content: {
                algorithm: "m.megolm.v1.aes-sha2",
            },
        },
    ],
});

await client.sendTextMessage(roomId.room_id, "Привет, это E2E сообщение");

client.on(sdk.RoomEvent.Timeline, (event, room, toStartOfTimeline) => {
    if (event.getType() === "m.room.message") {
        const content = event.getContent();
        console.log("Decrypted message:", content.body);
    }
});

const devices = await client.getCrypto()?.getUserDeviceInfo(["@user:server"]);
if(devices) {
    devices.forEach((device, deviceId) => {
        console.log(deviceId, device)
        client.getCrypto()?.requestDeviceVerification("@user:server", deviceId)
    })
}