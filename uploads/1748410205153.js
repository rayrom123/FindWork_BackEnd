// Cần cài đặt JSEncrypt: npm install jsencrypt
const JSEncrypt = require('jsencrypt').JSEncrypt;


// Hàm mã hóa chuỗi f bằng publicKey
function encryptWithJSEncrypt(f, publicKey) {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    const encrypted = encrypt.encrypt(f);
    return encrypted;
}

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQBvqrrdXIBOMK2wNfgslycw
NSPHmo4vXMi1WmKkaXaQNnmxfXpd0gkFEnNo1droRq1FmfrcssM16n48svm1Wup2
yy+c3SeLL2YLNRH90u4RdpF+UhCnpYUjpeu8TNBHHJG5tzQa58FWjyETvrz+XttQ
vOfZzM3bcvwKdJfI1wGvrg8SsEto/PHHc2nUkTs5n31MUYFaFAJjb90utLAcbecN
2Ye4Du0CZvVodOiZxXj2IAXeufkOZjE6gWkVJg0U11bMm1svticpXZ5YHjghdDdl
n2lehB33Ir1R59dUst85iHlGF3g4w/brHZbn7X2Mqbk1b74Dkw7teZrsqAdmUFbR
AgMBAAE=
-----END PUBLIC KEY-----`;

const textToEncrypt = 'f';
const encrypted = encryptWithJSEncrypt(textToEncrypt, publicKey);
console.log('Encrypted:', encrypted);



