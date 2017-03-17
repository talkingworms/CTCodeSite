module.exports = {
  'port': process.env.port || 8080,
  'database': 'mongodb://jakeconniff:lol123123@ds046549.mlab.com:46549/ctcodersdb',
  'secret': 'thissecretwillchange',
  'mailgun_api_key': 'key-153060d5c6d3f94ae7ea26dc35ee5ed3',
  'domain':'mail.ct-coders.com',
  'google_maps_api_key': 'AIzaSyBWOTxfxAHUVNkC93gDrI9VtRA31G_WxoA',
  testFunction: function() {
    return 'sushiondeck';
  }
};
