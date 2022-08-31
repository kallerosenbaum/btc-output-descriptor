const bitcoinLib = require('bitcoinjs-lib');
const KeyExpression = require('./KeyExpression');

class TapKeyExpression extends KeyExpression {
  constructor(network, keyType, text, value, origin) {
    super(network, Expression.Type.key, text, value);

    if (!isValidType(keyType)) {
        throw new TypeError(`Bitcoin output descriptor [KeyExpression]: invalid \'keyType\' argument (${keyType})`);
    }

    if (!Util.isNullArg(origin) && !isValidOrigin(origin)) {
        throw new TypeError(`Bitcoin output descriptor [KeyExpression]: invalid \'origin\' argument (${origin})`);
    }

    this.keyType = keyType;
    this.origin = origin;
}

  static parse(network, text) {
    const matchResult = text.match(/^(?<key>[A-Fa-f0-9]{64})+$/);

    if (matchResult) {
      // x-only pubkey as explained in
      // https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki#cite_ref-6-0
      const keyBuf = Buffer.from(matchResult.groups.key, 'hex');

      const ecPair = bitcoinLib.ECPair.fromPublicKey(
        Buffer.concat([Buffer.from([0x02]), keyBuf]), // Convert x-only key to "compressed even"
        {
          compressed: true,
          network
        }
      );
      if (!ecPair) {
        throw new Error(`Bitcoin output descriptor [TapKeyExpression#parse]: invalid public key (${matchResult.groups.key})`);
      }
      return new (require('./EcPairKey'))(network, text, ecPair, undefined);      
    }

    return super.parse(network, text);
  }
}

module.exports = TapKeyExpression;