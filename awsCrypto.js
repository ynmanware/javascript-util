// Copyright Amazon.com Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const {
    RawRsaKeyringNode,
    buildClient,
    CommitmentPolicy,
} = require ('@aws-crypto/client-node')
const { generateKeyPair } = require ('crypto')
const { promisify } = require ('util')
const generateKeyPairAsync = promisify(generateKeyPair)

/* This builds the client with the REQUIRE_ENCRYPT_REQUIRE_DECRYPT commitment policy,
 * which enforces that this client only encrypts using committing algorithm suites
 * and enforces that this client
 * will only decrypt encrypted messages
 * that were created with a committing algorithm suite.
 * This is the default commitment policy
 * if you build the client with `buildClient()`.
 */
const { encrypt, decrypt } = buildClient(
    CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT
)

/**
 * This function is an example of using the RsaKeyringNode
 * to encrypt and decrypt a simple string
 */
module.exports =  async function rsaTest() {
    /* You need to specify a name
     * and a namespace for raw encryption key providers.
     * The name and namespace that you use in the decryption keyring *must* be an exact,
     * *case-sensitive* match for the name and namespace in the encryption keyring.
     */
    const keyName = 'rsa-name'
    const keyNamespace = 'rsa-namespace'
    // Get your key pairs from wherever you  store them.
    const rsaKey = {
        "publicKey": "-----BEGIN PUBLIC KEY-----\n" +
            "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3enT5I2aj4iSMdjbMcut\n" +
            "pARvEQoJDskz/a40njX02b4wDsOt3OLhyKt47WXmfo5WqV8dl1dPx2SqoNzQW2KL\n" +
            "lhFnyFyv9b/5CyWZ9id/m7qmBvSt6Pu63xMajBqC3Yxt5hHwR0CScAAqDRtQW0kH\n" +
            "/pKyxyFURZhg3380UHPWr6msLLVd9JLJMTSe5QO+92ZTPNZEfvsXOaCl5/z2oxb6\n" +
            "gQylvoWhA0EP8L4PxQ4I5UNokkV/vwF9NmHwb+3MoMt3+g0LajSQGkTMXEBtsMjy\n" +
            "TXA4oEYrpFsy5zJHwrst5d/WMx9ZA3Wcy8Upe3krQut/LXuUHgy/VYXISrUpV63x\n" +
            "kwIDAQAB\n" +
            "-----END PUBLIC KEY-----\n",
        "privateKey": "-----BEGIN PRIVATE KEY-----\n" +
            "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDd6dPkjZqPiJIx\n" +
            "2Nsxy62kBG8RCgkOyTP9rjSeNfTZvjAOw63c4uHIq3jtZeZ+jlapXx2XV0/HZKqg\n" +
            "3NBbYouWEWfIXK/1v/kLJZn2J3+buqYG9K3o+7rfExqMGoLdjG3mEfBHQJJwACoN\n" +
            "G1BbSQf+krLHIVRFmGDffzRQc9avqawstV30kskxNJ7lA773ZlM81kR++xc5oKXn\n" +
            "/PajFvqBDKW+haEDQQ/wvg/FDgjlQ2iSRX+/AX02YfBv7cygy3f6DQtqNJAaRMxc\n" +
            "QG2wyPJNcDigRiukWzLnMkfCuy3l39YzH1kDdZzLxSl7eStC638te5QeDL9VhchK\n" +
            "tSlXrfGTAgMBAAECggEBALs0wluiFcyWYvaIQcoNUEv4rZXLSH7fv+t3Jc5+KDP0\n" +
            "nOgnramVAPJfraFgAIWtIHC72+PLdXL5enRAM8mUJbuQrWO6xXpk2/zKWMru4VkH\n" +
            "qX5etcPBcRE1NYUR7GpoSGH5qiEB2UeA6/ionS6VOphJO2Z/uG8JsFd7IS/puSfw\n" +
            "QjFdechSJj2RzUzwTWENFBvWRcP+opEzT/GNBpo/6vbM1E52zqWXAgaPl6QTYJ1g\n" +
            "jtiDT08SbPD49C3SbQaaODE2wXbaQRdWUVgqlanKAnNhb0EgeAHQSkDqMDx8jXPq\n" +
            "qS7jp/qjYtFFwYVh7wKnagPttxGvkspahTYYehHIB8ECgYEA8Tnm9aymkLyHymzk\n" +
            "4JHFRQN4+Kn+OK3XvbIxg50kL93jBfVnFVoDZK7g0tjmXL+qzfUKJFrf0JUukRkz\n" +
            "gzJhLQqRSCDlPQYTyxeuZWntfYD/Z+WtHxTRKKLgaJHOYOTzXw4/UReiHxVSV1QW\n" +
            "4LiBMqREZde9WXQlsUVWBMhX+zMCgYEA64EglQLqnHbODbYSg251B3Wgil0z2Q9O\n" +
            "h65hGkMb1ZNcLG6hwGdpjroTSsmSD8LtLUf/6udJ0wcR0LlY8DjjB+nOjQsRzjZA\n" +
            "KWNMSSDR9n0734xT5Mee/NZ6/lrnsGsHRS3+Ox0Eg/S+N+kW3EPwV0D1rLuyV6kq\n" +
            "aqIzFX3PMCECgYAsqZHPjsXQKnfhzMObqKGjo370W1UMXXOCVcnBGokmq6hq5ALP\n" +
            "+ziBnbdWkn4kUgBn3aShEoo57kUO7GGTOvKvCjPX7O9EmylzAtFxSWmFQSsIq4eg\n" +
            "J5SKN43hDo3tdrZwtQyYEQ4dPy9dp94MgVy6aZuYV5dhRpXr+nBwtj9D7QKBgFOT\n" +
            "ndaEFHK2juW6ydMu7gVZr0GrVe0gS4RHVFqXmlcvVrTGBk1b5dArJRGTe2xwhu9c\n" +
            "7+uTbVWg2qeyP2fxKFD0nsLbPNRr2FVX0gjZxumtBASPrm4wkbG1BC0kYbjwIsJg\n" +
            "Uir0X1fdEWySIfTFf5PXj9hfPClz9YOmUG6+GTtBAoGBAIbIeXJfqBvHcamIscxE\n" +
            "zfyr1B0vRG5FdgfaOjurfFLWJW/H5f6Z00OKo3M9M4sl9pxv//HLjRlm1xIEGQ5c\n" +
            "UTpClCOCWG8QqRHe+zpnx+075scCJ3qgqW1REMC4pPlUVKAAtdDhQDly617pDb4a\n" +
            "9w2D3Bc0/ToEM48SJot7TuUM\n" +
            "-----END PRIVATE KEY-----\n"
    }


    /* The RSA keyring must be configured with the desired RSA keys
     * If you only want to encrypt, only configure a public key.
     * If you only want to decrypt, only configure a private key.
     */
    const keyring = new RawRsaKeyringNode({ keyName, keyNamespace, rsaKey })

    /* Encryption context is a *very* powerful tool for controlling and managing access.
     * It is ***not*** secret!
     * Encrypted data is opaque.
     * You can use an encryption context to assert things about the encrypted data.
     * Just because you can decrypt something does not mean it is what you expect.
     * For example, if you are are only expecting data from 'us-west-2',
     * the origin can identify a malicious actor.
     * See: https://docs.aws.amazon.com/encryption-sdk/latest/developer-guide/concepts.html#encryption-context
     */
    const context = {
        stage: 'demo',
        purpose: 'simple demonstration app',
        origin: 'us-west-2',
    }

    /* Find data to encrypt.  A simple string. */
    const cleartext = 'asdf'

    /* Encrypt the data. */
    const { result } = await encrypt(keyring, cleartext, {
        encryptionContext: context,
    })
    /* Decrypt the data. */
    const { plaintext, messageHeader } = await decrypt(keyring, result)

    /* Grab the encryption context so you can verify it. */
    const { encryptionContext } = messageHeader

    /* Verify the encryption context.
     * If you use an algorithm suite with signing,
     * the Encryption SDK adds a name-value pair to the encryption context that contains the public key.
     * Because the encryption context might contain additional key-value pairs,
     * do not add a test that requires that all key-value pairs match.
     * Instead, verify that the key-value pairs you expect match.
     */
    Object.entries(context).forEach(([key, value]) => {
        if (encryptionContext[key] !== value)
            throw new Error('Encryption Context does not match expected values')
    })

    /* Return the values so the code can be tested. */
    return { plaintext, result, cleartext }
}

/**
 * This is a helper function to generate an RSA key pair for testing purposes only.
 */
async function generateRsaKeys() {
    const modulusLength = 3072
    const publicKeyEncoding = { type: 'pkcs1', format: 'pem' }
    const privateKeyEncoding = { type: 'pkcs1', format: 'pem' }
    // @ts-ignore
    return generateKeyPairAsync('rsa', {
        modulusLength,
        publicKeyEncoding,
        privateKeyEncoding,
    })
}
