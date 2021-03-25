/**
 * Created by claudio on 2021-03-22
 */

const bitcoinLib = require('bitcoinjs-lib');
const Expression = require('./Expression');
const ScriptExpression = require('./ScriptExpression');
const Util = require('./Util');

class WpkhScript extends ScriptExpression {
    get keyParam() {
        return this.children[0];
    }

    get outputScripts() {
        return this._payments.map(payment => payment.output);
    }

    get addresses() {
        return this._payments.map(payment => payment.address);
    }

    get _payments() {
        return this.keyParam.publicKeys.map(pubKey => {
            try {
                return bitcoinLib.payments.p2wpkh({
                    pubkey: pubKey,
                    network: this.network
                });
            }
            catch(err) {
                throw new Error(`Bitcoin output descriptor [WpkhScript#_payments]: error deriving P2WPKH payment from public key (${Util.inspect(pubKey)}): ${err}`);
            }
        });
    }

    constructor(network, text, value, children, checksum) {
        super(network, ScriptExpression.Type.wpkh, text, value, children, checksum);

        if (!this.hasChildren || this.children.length > 1 || this.children[0].type !== Expression.Type.key) {
            throw new Error(`Bitcoin output descriptor [WpkhScript]: inconsistent child expressions; wrong number and/or type (${Util.inspect(children)})`);
        }
    }
}

module.exports = WpkhScript;
