/*
 ** Analysis Example
 ** Sending downlink using dashboard
 **
 ** Using an Input Widget in the dashboard, you will be able to trigger a downlink to
 ** any LoraWaN network server.
 ** You can get the dashboard template to use here: http://admin.tago.io/template/5f514218d4555600278023c4
 **
 ** Environment Variables
 ** In order to use this analysis, you must setup the Environment Variable table.
 **
 ** account_token: Your account token. Check bellow how to get this.
 ** default_PORT: The default port to be used if not sent by the dashboard.
 **
 ** Steps to generate an account_token:
 ** 1 - Enter the following link: https://admin.tago.io/account/
 ** 2 - Select your Profile.
 ** 3 - Enter Tokens tab.
 ** 4 - Generate a new Token with Expires Never.
 ** 5 - Press the Copy Button and place at the Environment Variables tab of this analysis.
 */
const { Analysis, Account, Utils } = require('@tago-io/sdk');
const axios        = require('axios');

async function init(context, scope) {
  if (!scope[0]) return context.log('This analysis must be triggered by a widget.');

  context.log('Downlink analysis started');
  // Get the environment variables.
  const env = Utils.envToJson(context.environment);
  if (!env.account_token) return context.log('Missing "account_token" environment variable');
  else if (env.account_token.length !== 36) return context.log('Invalid "account_token" in the environment variable');

  // Instance the Account class
  const account = new Account({ token: env.account_token });

  // Get the variables form_payload and form_port sent by the widget/dashboard.
  const payload = scope.find(x => x.variable === 'form_payload');
  const port = scope.find(x => x.variable === 'form_port') || { value: env.default_PORT };
  if (!payload || !payload.value) return context.log('Missing "form_payload" in the data scope.');
  else if (!port || !port.value) return context.log('Missing "form_port" in the data scope.');

  const device_id = payload.origin; // All variables that trigger the analysis have the "origin" parameter, with the TagoIO Device ID.
  if (!device_id) return context.log('Device ID <origin> not found in the variables sent by the widget/dashboard.');

  // Find the token containing the authorization code used.
  const device_tokens = await account.devices.tokenList(device_id, 1, 10, {}, ['serie_number', 'last_authorization']);
  const token = device_tokens.find(x => x.serie_number && x.last_authorization);
  if (!token) return context.log("Couldn't find a token with serial/authorization for this device");

  // Get the connector ID from the device
  const { connector: connector_id } = await account.devices.info(device_id);
  if (!connector_id) return context.log('Device is not using a connector.');

  // Get the connector information with the NS URL for the Downlink
  const connector = await account.connector.info(connector_id);
  if (!connector.options.middleware) return context.log("Couldn't find a connector middleware for this device.");

  // Set the parameters for the device. Some NS like Everynet need this.
  const params = await account.devices.paramList(device_id);
  const downlink_param = params.find(x => x.key === 'downlink');
  if (downlink_param) {
    await account.devices.paramEdit(device_id, downlink_param.id, { value: payload, sent: false });
  } else {
    await account.devices.paramCreate(device_id, { key: 'downlink', value: payload, sent: false });
  }

  context.log('Trying to send the downlink');
  const data = {
    device: token.serie_number,
    authorization: token.last_authorization,
    payload: payload.value,
    port: port.value,
  };

  await axios.post(`https://${connector.options.middleware}/downlink`, data)
   .catch((error) => {
     context.log(`Downlink failed with status ${error.response.status}`);
     context.log(error.response.data : JSON.stringify(error));
   })
   .then((result) => {
     context.log(`Downlink accepted with status ${result.status}`);
   });
}

module.exports = new Analysis(init);
