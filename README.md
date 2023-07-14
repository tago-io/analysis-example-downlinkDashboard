## What the analysis does

Analysis Example

Sending downlink using dashboard

Using an Input Widget in the dashboard, you will be able to trigger a downlink to any LoraWaN network server.
You can get the dashboard template to use here: http://admin.tago.io/template/5f514218d4555600278023c4

`npm install`<br>
`node analysis.js`

## How to use this analysis internally at TagoIO servers

In order to use this analysis, you must to add a new policy in your account and setup the Environment Variable table.<br>

Environment Variables:

    1 - default_PORT: The default port to be used if not sent by the dashboard.

    2 - device_id: The default device id to be used if not sent by the dashboard (OPTIONAL).

    3 - payload: The default payload to be used if not sent by the dashboard (OPTIONAL).


Steps to add a new policy:

   1 - Click the button "Add Policy" at this url: https://admin.tago.io/am;

   2 - In the Target selector, with the field set as "ID", choose your Analysis in the list;

   3 - Click the "Click to add a new permission" element and select "Device" with the rule "Access" with the field as "Any";

   4 - To save your new Policy, click the save button in the bottom right corner;<br>