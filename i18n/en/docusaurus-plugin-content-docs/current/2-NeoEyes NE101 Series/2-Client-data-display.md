# Client data display
## overview

This chapter helps you connect NE101 devices to the network and establish reliable connections with MQTT clients using the MQTT protocol, laying the foundation for subsequent data transmission, device control, and other functions.

## Early preparation

* **Hardware device**: NE101
* **MQTT server**: broker.emqx.io (public MQTT server address provided by EMQ)
* **MQTT client**: MQTTX
* **Other devices**: PC or mobile device (used to access the device Web configuration page)
* **Network environment**: An valid and relatively stable network environment that can connect to remote servers

## Specific operation

### NE101 Device Configuration

1. For device configuration details, see [official website](https://camthink-ai.github.io/wiki-documents/docs/NeoEyes%20NE101%20Series/Quick%20Start)

2. **Configuration page**

   * Host (can be a public MQTT server domain name [e.g：`broker.emqx.io`] or the IP address of a deployed MQTT server [e.g： `192.168.1.100`]. Note: Do not upload sensitive data to public servers.)````
   * MQTT Port ( Default port：1883)
   * Topic (customize the topic according to data reported by NE101)
   * After configuration is complete, click Save. If the status shows "Connected," the IoT device has successfully connected to the MQTT server.

      ![Jump to page](/img/NE101-data/NE101-data-01.png)


### MQTT Client Configuration


1. Download MQTTX client for PC.[MQTTX official website](https://mqttx.app/)

2. Open the downloaded MQTTX and click “Create Connection”.

   ![Jump to page](/img/NE101-data/NE101-data-02.png)

3. Enter the basic connection information, including Name (custom), Host (must be consistent with the MQTT server address on the IoT device configuration page), and Port (must be consistent with the Port number on the IoT device configuration page, the default is 1883).********

   ![Jump to page](/img/NE101-data/NE101-data-03.png)

4. Click “connect” in the upper right corner to create the connection.

   ![Jump to page](/img/NE101-data/NE101-data-04.png)

5. If the on-off key appears in the upper right corner, the connection is successful . Initiate an MQTT topic subscription request by clicking "New Subscription".

   ![Jump to page](/img/NE101-data/NE101-data-05.png)

6. Copy the device’s topic and paste it into the MQTT topic field (**make sure it matches the topic on the NE101 device**), then click Confirm.

   ![Jump to page](/img/NE101-data/NE101-data-06.png)

### Verify Connection Success

1. Start NE101 and press the capture button to take a photo.

2. Check whether the MQTT client has uploaded data.

   ![Jump to page](/img/NE101-data/NE101-data-07.png)

3. If the above data appears, it indicates that NE101 has successfully exchanged data with the MQTT client through the MQTT server.
### Image preview 

1. After obtaining MQTT data in the MQTT client, extract the "image" field, open an online base converter such as Base64.Guru [official website](https://base64.guru/converter/decode/image) , and enter the extracted "image" field.

   ![Jump to page](/img/NE101-data/NE101-data-08.png)

2. Click "Decode Base64 to Image" to preview the image.

   ![Jump to page](/img/NE101-data/NE101-data-09.png)

3. View information, download images, etc.

   ![Jump to page](/img/NE101-data/NE101-data-10.png)

### Issue Summary

1. MQTT client and MQTT server repeatedly disconnecting
   * Cause: Unstable network
     * Solution: Switch to a more stable external network

2. MQTT client unable to receive NE101 device data
   * Possible Cause ①: Device disconnected due to unstable network
     * Solution: After disconnection, the device will attempt to reconnect to the network seven times. During this period, observe the MQTT client to see if it receives operational data uploaded by the device. If no data is received, manually connect the network on the device’s web configuration page.
   * Possible Cause ②: The MQTT client subscription topic was not copied and pasted, and manual entry may result in subtle differences
     * Solution: Redo steps 5 and 6 of configuring the MQTT client.