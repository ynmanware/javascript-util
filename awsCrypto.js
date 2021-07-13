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
    /*const rsaKey = {
        "publicKey": "-----BEGIN RSA PUBLIC KEY-----\nMIIBigKCAYEAxGZg2XNophpbN1WGoWp8HucP2CjGV9dSCijuZtCX0LO+PrOh6OAQ\nofbDI29ce0K3rFuS+x9Rs9s8xLOLBidBlUhAl32r87sCRI7XVvuYrKaiK+Xj+uIp\nQBK6OLui0ZYjnIXCCY4C/a2NvP3IIro0DdSqvMmipN5CQuSAJjVd9ZiheBzGNbVR\nDuA/43aBsE9WXRAui5+eUbEAkq/mkoWlD+NbJCf/1fDTWpU+efQxBIuKKmxqfotz\nCwo7oyD/mKAtR+7LWnU+PdMPEzpM7cZHZrLnOBEP8LLCVA+zvAfU0iNg2Yzc7ujQ\n0AGBdUfgT4/yQLL4ih96DQsOuIl/mpfF5sE2q9sVIPYC8sZtVqoVanaWSiUD4ix9\nKK1uwJFrXYkQ9jgpf01QCflyXVv6swrFegkglXJyg7EIC5y651KIA5rVix6hHl9S\nvf64usy3pwAlKvUDlQglxPgmi5IXKoSt8d0CyiX/7FQpyFlRjfIGMWHw0CIo0cbp\nELP94Cxk3mZnAgMBAAE=\n-----END RSA PUBLIC KEY-----\n",
        "privateKey": "-----BEGIN RSA PRIVATE KEY-----\n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\n-----END RSA PRIVATE KEY-----\n"
    }*/

    const rsaKey = {
     "publicKey": "-----BEGIN PUBLIC KEY-----\n" +
         "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuKQul3AVAgtSxe8FL3G+\n" +
         "Ho/dPA2u5kMvPXfCQlQ1R4eM+ZPhdj3KfoiFfvAH0n0FJbaaoBZ1Mz0yOPRjnt6v\n" +
         "aD/+hPVCgU/C7+Nwe0ArmWihVS0/2Ro9C2VI4pSgkmQA/rFKJRQFoupg3r7ZywLc\n" +
         "6jH4JrisLmfX5UKt+Lj+IIjYEz7c7r7ysV2fKYY/CLrQNuDLjz4uSy0aVWYeDnRM\n" +
         "8pbVrXxrp8AJPFG1SHIFuJ+1Wbzn4T0DhlhYxaLdNoZDwtwSJv3mBu/F8Fop4ykN\n" +
         "S/MgV1vE8zsJoIy7Tkv/0aj7QkalOKb8cPO1x4N+0l8Uk2wqGwYt344UFqcaN8pm\n" +
         "uQIDAQAB\n" +
         "-----END PUBLIC KEY-----",

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
