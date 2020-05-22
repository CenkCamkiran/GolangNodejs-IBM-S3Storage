/**
  * CONFIG PARAMETERS
  * useHmac: Use HMAC credentials - defaults to false
  * bucketName: The name of the selected bucket
  * serviceCredential: This is a  service credential created in a service instance
  *
  * INSTRUCTIONS
  * - Install Nodejs 10 or above, Then run the following commands
  * - npm i ibm-cos-sdk
  * - npm i request-promise
  * - node <scriptName>
  *
  * ========= Example Configuration =========
  * export default {
  *   useHmac: false,
  *   bucketName: 'testbucketname',
  *   serviceCredential: {
  *     "apikey": "XXXXXXXX",
  *     "cos_hmac_keys": {
  *       "access_key_id": "XXXXXXXXX",
  *       "secret_access_key": "XXXXXXXX"
  *     },
  *     "endpoints": "https://control.cloud-object-storage.cloud.ibm.com/v2/endpoints",
  *     "iam_apikey_description": "Auto-generated for key XXXXXX-XXXX-XXXX-XXXX",
  *     "iam_apikey_name": "Service credentials-2",
  *     "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Writer",
  *     "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/XXXXXXXX::serviceid:ServiceId-XXXXX-XXXXX-XXXXX",
  *     "resource_instance_id": "crn:v1:bluemix:public:cloud-object-storage:global:a/XXXXXXXX:XXXXX-XXXXX-XXXXX-XXXX::"
  *   },
  * };
  */

// ========= Configuration =========
var CONFIG = {
    useHmac: false,
    bucketName: 'cloud-object-storage-jx-cos-standard-o40', //cloud-object-storage-jx-cos-standard-o40
    serviceCredential: {
      "apikey": "U2iOhwKpEsfCmwwR3OQvdsXdCrgWj861lZI6oXzXGlkZ",
      "cos_hmac_keys": {
        "access_key_id": "0b1866cd69bd47a2ae4b5ef41b35ed0d",
        "secret_access_key": "cca79d06415cf505dbcd6a9aa5e60413c16196ca310f52f9"
      },
      "endpoints": "https://control.cloud-object-storage.cloud.ibm.com/v2/endpoints",
      "iam_apikey_description": "Auto-generated for key 0b1866cd-69bd-47a2-ae4b-5ef41b35ed0d",
      "iam_apikey_name": "Service credentials-1",
      "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Writer",
      "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/ed5bda0599d0413484f54f0d04745bc8::serviceid:ServiceId-0e8dd41e-e42b-4782-958b-8d2ed653666d",
      "resource_instance_id": "crn:v1:bluemix:public:cloud-object-storage:global:a/ed5bda0599d0413484f54f0d04745bc8:aa833fda-313a-441b-b09c-1fa2226e66f2::"
    },
  };
  
  const IBMCOS = require('ibm-cos-sdk');
  
  const getS3 = async (endpoint, serviceCredential) => {
    let s3Options;
  
    if (serviceCredential.apikey) {
      /*
         * Cloud Object Storage S3 can be access via two types of credentials. IAM/HMAC
         * An IAM APIKey can be used to create an S3 Object as below.
         * The APIKey, S3 endpoint and resource Instance Id are required
         */
      s3Options = {
        apiKeyId: serviceCredential.apikey,
        serviceInstanceId: serviceCredential.resource_instance_id,
        region: 'ibm',
        endpoint: new IBMCOS.Endpoint(endpoint),
      };
    } else {
      throw new Error('IAM ApiKey required to create S3 Client');
    }
  
    console.info(' S3 Options Used: \n', s3Options);
    console.debug('\n\n ================== \n\n');
    return new IBMCOS.S3(s3Options);
  };
  
  const getS3Hmac = async (endpoint, serviceCredential) => {
    let s3Options;
  
    if (serviceCredential.cos_hmac_keys && serviceCredential.cos_hmac_keys.access_key_id) {
      /*
        * Cloud Object Storage S3 can be access via two types of credentials. IAM/HMAC
        * An HMAC Credential is the equivalent of the AWS S3 credential type
        * The Access Key Id, Secret Access Key, and S3 Endpoint are needed to use HMAC.
        */
      s3Options = {
        accessKeyId: serviceCredential.cos_hmac_keys.access_key_id,
        secretAccessKey: serviceCredential.cos_hmac_keys.secret_access_key,
        region: 'ibm',
        endpoint: new IBMCOS.Endpoint(endpoint),
      };
    } else {
      throw new Error('HMAC credentials required to create S3 Client using HMAC');
    }
  
    console.info(' S3 Options Used: \n', s3Options);
    console.debug('\n\n ================== \n\n');
    return new IBMCOS.S3(s3Options);
  };
  
  const rp = require('request-promise');
  
  /*
   * Cloud Object Storage is available in 3 resiliency across many Availability Zones across the world.
   * Each AZ will require a different endpoint to access the data in it.
   * The endpoints url provides a JSON consisting of all Endpoints for the user.
   */
  const getEndpoints = async (endpointsUrl) => {
    console.info('======= Getting Endpoints =========');
  
    const options = {
      url: endpointsUrl,
      method: 'GET'
    };
    const response = await rp(options);
    return JSON.parse(response);
  };
  
  /*
   * Once we have the available endpoints, we need to extract the endpoint we need to use.
   * This method uses the bucket's LocationConstraint to determine which endpoint to use.
   */
  const findBucketEndpoint = (bucket, endpoints) => {
    const region = bucket.region || bucket.LocationConstraint.substring(0, bucket.LocationConstraint.lastIndexOf('-'));
    const serviceEndpoints = endpoints['service-endpoints'];
    const regionUrls = serviceEndpoints['cross-region'][region]
    || serviceEndpoints.regional[region]
    || serviceEndpoints['single-site'][region];
  
    if (!regionUrls.public || Object.keys(regionUrls.public).length === 0) {
      return '';
    }
    return Object.values(regionUrls.public)[0];
  };
  
  /*
   * A simple putObject to upload a simple object to COS.
   * COS also allows Multipart upload to facilitate upload of larger objects.
   */
  const putObjects = async (s3, bucketName) => {
    const params1 = {
      Bucket: bucketName,
      Key: 'cenk1',
      Body: 'Yayy!!! Your First Object uploaded into COS!!',
      Metadata: {
        fileType: 'sample'
      }
    };
  
    const params2 = {
      Bucket: bucketName,
      Key: 'cenk2',
      Body: 'Yayy!!! Your Second Object uploaded into COS!',
      Metadata: {
        fileType: 'sample'
      }
    };
    const params3 = {
      Bucket: bucketName,
      Key: 'cenk3',
      Body: 'Yayy!! Your Third Object uploaded into COS!',
      Metadata: {
        fileType: 'sample'
      }
    };
    console.info(' putting Objects \n', params1, params2, params3);
  
    const data = await Promise.all([
      s3.putObject(params1).promise(),
      s3.putObject(params2).promise(),
      s3.putObject(params3).promise()
    ]);
    console.info(' Response: \n', JSON.stringify(data, null, 2));
    return true;
  };
  
  /*
   * Download an Object from COS
   */
  const getObject = async (s3, bucketName, objectName) => {
    const getObjectParam = {
      Bucket: bucketName,
      Key: objectName
    };
    console.info(' getObject \n', getObjectParam);
  
    const data = await s3.getObject(getObjectParam).promise();
    console.info(' Response: \n', JSON.stringify(data, null, 2));
    return data;
  };
  
  /*
   * Fetch the headers and any metadata attached to an object
   */
  const headObject = async (s3, bucketName, objectName) => {
    const headObjectP = {
      Bucket: bucketName,
      Key: objectName
    };
    console.info(' headObject \n', headObjectP);
  
    const data = await s3.headObject(headObjectP).promise();
    console.info(' Response: \n', JSON.stringify(data, null, 2));
    return data;
  };
  
  /*
   * Delete a selected Object
   */
  const deleteObject = async (s3, bucketName, objectName) => {
    const deleteObjectP = {
      Bucket: bucketName,
      Key: objectName
    };
    console.info(' deleteObject \n', deleteObjectP);
  
    const data = await s3.deleteObject(deleteObjectP).promise();
    console.info(' Response: \n', JSON.stringify(data, null, 2));
    return data;
  };
  
  const listObjects = async (s3, bucketName) => {
    const listObject = {
      Bucket: bucketName
    };
    console.info(' fetching object list \n', listObject);
  
    const data = await s3.listObjectsV2(listObject).promise();
    console.info(' Response: \n', JSON.stringify(data, null, 2));
    return data;
  };
  
  /*
   * The listBucketsExtended S3 call will return a list of buckets along with the LocationConstraint.
   * This will help in identifing the endpoint that needs to be used for a given bucket.
   */
  const listBuckets = async (s3, bucketName) => {
    const params = {
      Prefix: bucketName
    };
    console.error('\n Fetching extended bucket list to get Location');
    const data = await s3.listBucketsExtended(params).promise();
    console.info(' Response: \n', JSON.stringify(data, null, 2));
  
    return data;
  };
  
  const defaultEndpoint = 's3.us.cloud-object-storage.appdomain.cloud';
  //const defaultEndpoint = 's3.eu-de.cloud-object-storage.appdomain.cloud';
  
  console.info('\n ======== Config: ========= ');
  console.info('\n ', CONFIG);
  
  /*
     * Sample script to give an example of uploading and downloading objects to a given bucket
     *
     */
  const main = async () => {
    try {
      /* Extract the serviceCredential and bucketName from the config.js file
       * The service credential can be created in the COS UI's Service Credential Pane
       */
      const { serviceCredential } = CONFIG;
      const { bucketName } = CONFIG;
  
      /* Create the S3 Client using the IBM-COS-SDK - https://www.npmjs.com/package/ibm-cos-sdk
       * We will use a default endpoint to initially find the bucket endpoint
       *
       * COS Operations can be done using an IAM APIKey or HMAC Credentials.
       * We will create the S3 client differently based on what we use.
       */
      let s3;
      if (!CONFIG.useHmac) {
        s3 = await getS3(defaultEndpoint, serviceCredential);
      } else {
        s3 = await getS3Hmac(defaultEndpoint, serviceCredential);
      }
  
      /* Fetch the Extended bucket Info for the selected bucket.
       * This call will give us the bucket's Location
       */
      const data = await listBuckets(s3, bucketName);
      const bucket = data.Buckets[0];
  
      /* Fetch all the available endpoints in Cloud Object Storage
       * We need to find the correct endpoint to use based on our bucjket's location
       */
      const endpoints = await getEndpoints(serviceCredential.endpoints);
  
      /* Find the correct endpoint and set it to the S3 Client
       * We can skip these steps and directly assign the correct endpoint if we know it
       */
      s3.endpoint = findBucketEndpoint(bucket, endpoints);
  
      /* Upload Objects into the selected bucket
       */
      await putObjects(s3, bucketName);
  
      /* Fetch the list of uploaded objects
       */
      const objectList = await listObjects(s3, bucketName);
  
      const objectName = objectList.Contents[0].Key;
  
      /* Get one of the objects and head one of the objects
       */
      await getObject(s3, bucketName, objectName);
      await headObject(s3, bucketName, objectName);
  
      /* Delete one of the objects
       */
      await deleteObject(s3, bucketName, objectName);
  
      /* Do an object listing again
       */
      await listObjects(s3, bucketName);
  
      console.info('\n\n ============= script completed ============ \n\n');
    } catch (err) {
      console.error('Found an error in S3 operations');
      console.error('statusCode: ', err.statusCode);
      console.error('message: ', err.message);
      console.error('stack: ', err.stack);
      process.exit(1);
    }
  };
  
  function end() {
    console.info('\n\n ===== end ===== \n\n');
    process.exit(1);
  }
  
  const timeout = setTimeout(end, 120000);
  timeout.unref();
  
  //main();

  const fs = require("fs");

  var fonksiyon = async function(){
    const { serviceCredential } = CONFIG;
    const { bucketName } = CONFIG;

    let s3;
    if (!CONFIG.useHmac) {
      s3 = await getS3(defaultEndpoint, serviceCredential);
    } else {
      s3 = await getS3Hmac(defaultEndpoint, serviceCredential);
    }

    const data = await listBuckets(s3, bucketName);
    const bucket = data.Buckets[0];

    const endPointList = await getEndpoints(serviceCredential.endpoints)
    //console.log(response["service-endpoints"]["regional"]);

    s3.endpoint = await findBucketEndpoint(bucket, endPointList)
    console.log("**************************" + s3.endpoint + "***********************************\n");

    var textContent;

    /**
     * var path = require('path');
       uploadParams.Key = path.basename("dosya adı");
     */
    fs.readFile("1522672075.291220.mp3", function(err, data) {

      if (err){
        console.log(err);
      }

      var requestData = {
        key: "1522672075.291220.mp3", //dosyanın ismi //key uzantı verirsen ona göre download eder
        body: data,
        meta: "audio/mpeg"
      }
      
      insertObject(s3, bucketName, requestData) //varolan verinin üstüne yazabilirsin(aynı key ile)

    })


    var result = await listObjects(s3, bucketName)
    var resultData = await getObject(s3, bucketName, result.Contents[0].Key)

    console.log("*********************************************************************************\n");
    console.log("*********************************************************************************\n");
    console.log("*********************************************************************************\n");

    console.log(resultData);

    fs.writeFile("cenk.mp3", resultData.Body, function(err) {

      if (err){
        console.log(err);

      } else{
        console.log("Başarılı");
      }
    })

    /**
     * {
  AcceptRanges: 'bytes',
  LastModified: 'Thu, 21 May 2020 14:18:16 GMT',
  ContentLength: '882360',
  ETag: '"1363bdfa2c61ba820ca40022df887939"',
  ContentType: 'application/octet-stream',
  Metadata: { filetype: 'audio/mpeg' },
  Body: <Buffer ff e3 48 c4 00 00 00 00 00 00 00 00 00 58 69 6e 67 00 00 00 0f 00 00 17 61 00 0d 76 b8 00 02 05 08 0a 0d 0f 12 14 17 1a 1c 1f 21 24 27 29 2b 2e 31 33 ... 882310 more bytes>
}
     */

    console.log("*********************************************************************************\n");
    console.log("*********************************************************************************\n");
    console.log("*********************************************************************************\n");
    //var result = await listObjects(s3, bucketName)
    //console.log(result.Contents[0]); //result.Contents[0]

    //await deleteObject(s3, bucketName, result.Contents[0].Key)
    /*await putObjects(s3, bucketName)

    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");

    const objects = await listObjects(s3, bucketName)

    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");

    console.log(objects["Contents"][0].Key); //objects["Contents"][0].Key
    console.log(objects["Contents"][1].Key); //objects["Contents"][0].Key
    console.log(objects["Contents"][2].Key); //objects["Contents"][0].Key

    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");

    const objectData = await getObject(s3, bucketName, objects["Contents"][0].Key)

    const objectHeaderData = await headObject(s3, bucketName, objects["Contents"][0].Key)

    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");

    console.log("**********************getObject()**********************\n");
    console.log(objectData);
    console.log("**********************getObject()**********************\n");

    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");

    console.log("**********************headObject()**********************\n");
    console.log(objectHeaderData);
    console.log("**********************headObject()**********************\n");

    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");
    console.log("**********************************************************************************\n");

    await deleteObject(s3, bucketName, objects["Contents"][4].Key)*/

  }

  fonksiyon()

  const insertObject = async (s3, bucketName, objectData) => {
    const object = {
      Bucket: bucketName,
      Key: objectData.key,
      Body: objectData.body,
      Metadata: {
        fileType: objectData.meta
      }
    };
    console.info(' putting Objects \n', object);
  
    const data = await Promise.all([
      s3.putObject(object).promise()
    ]);

    console.info(' Response: \n', JSON.stringify(data, null, 2));
    return true;

  };