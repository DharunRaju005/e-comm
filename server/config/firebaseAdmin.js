const dotenv = require("dotenv");
dotenv.config();

const admin = require("firebase-admin");

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace escaped newlines
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://e-com-8cc81.appspot.com'
});

const bucket = admin.storage().bucket();

const uploadImgToFirebase=async(file,filename)=>{
    const upload=bucket.file(filename);
    const stream=upload.createWriteStream({
        metadata:{
            contentType:file.mimetype
        },
        resumable:false
    });
    return new Promise((resolve,reject)=>{
        stream.on('finish',async()=>{
            try{
                await upload.makePublic();
                const URL=`https://storage.googleapis.com/${bucket.name}/${upload.name}`;
                resolve(URL);
            }
            catch(err){
                reject(err);
            }
        })
        stream.end(file.buffer)
    })
}
module.exports={admin,bucket,uploadImgToFirebase}
