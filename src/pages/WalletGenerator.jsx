import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import nacl from 'tweetnacl';
import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';
import ethUtil from 'ethereumjs-util';
import HDKey from 'hdkey';
import { Buffer } from 'buffer';

function WalletGenerator({ onGenerateWallet }) {
    const [mnemonics, setMnemonics] = useState("");
    const [wallets, setWallets] = useState({});
    const navigate = useNavigate();

    const handleGenerateMnemonics = () => {
        const mnemonic = generateMnemonic();
        setMnemonics(mnemonic);

        const seed = mnemonicToSeedSync(mnemonic);
        const paths = {
            solana: "m/44'/501'/0'/0'",
            ethereum: "m/44'/60'/0'/0'",
        };

        const generatedWallets = {};

        Object.entries(paths).forEach(([coin, path]) => {
            try {
                if (coin === 'solana') {
                    const derivedSeed = derivePath(path, seed.toString('hex')).key;
                    const keypair = nacl.sign.keyPair.fromSeed(derivedSeed);
                    const publicKey = Keypair.fromSecretKey(keypair.secretKey).publicKey.toBase58();
                    generatedWallets[coin] = {
                        address: publicKey,
                        secret: Buffer.from(keypair.secretKey).toString('hex'),
                    };
                } else if (coin === 'ethereum') {
                    const hdkey = HDKey.fromMasterSeed(seed);
                    const childKey = hdkey.derive(path);
                    const privateKey = childKey.privateKey;
                    const publicKey = ethUtil.privateToPublic(privateKey);
                    const address = ethUtil.publicToAddress(publicKey).toString('hex');
                    generatedWallets[coin] = {
                        address: `0x${address}`,
                        secret: privateKey.toString('hex'),
                    };
                }
            } catch (error) {
                generatedWallets[coin] = { error: `Error generating ${coin} keypair: ${error.message}` };
            }
        });

        setWallets(generatedWallets);

        if (onGenerateWallet) {
            onGenerateWallet({ mnemonic, wallets: generatedWallets });
        }

        // Navigate to a different page if needed
        // navigate('/wallet-details');
    };

    return (
        <div
            className="
                flex
                flex-col
                items-center
                justify-center
                h-screen
            "
        >
            <button
                className="
                    bg-[#1C1816]
                    hover:bg-[#2d2a28e9]
                    text-white 
                    font-bold 
                    py-2 
                    px-4 
                    rounded-full 
                    focus:outline-none 
                    focus:shadow-outline
                    hover:text-white 
                    font-roboto 
                    text-xl 
                    mt-4
                    flex
                    gap-2
                    items-center
                "
                onClick={handleGenerateMnemonics}
            >
                Generate Mnemonics
            </button>

            {mnemonics && (
                <div className="mt-4 text-white">
                    <h2 className="text-2xl font-bold">Mnemonics:</h2>
                    <p>{mnemonics}</p>
                </div>
            )}

            {Object.keys(wallets).length > 0 && (
                <div className="mt-4 text-white">
                    <h2 className="text-2xl font-bold">Wallets:</h2>
                    {Object.entries(wallets).map(([coin, wallet]) => (
                        <div key={coin}>
                            <h3 className="text-xl font-bold">{coin.toUpperCase()}:</h3>
                            <p>Address: {wallet.address}</p>
                            <p>Secret: {wallet.secret}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default WalletGenerator;
