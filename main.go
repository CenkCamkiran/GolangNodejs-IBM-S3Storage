package main

import (
	"fmt"
	_ "bytes"
	_ "io/ioutil"

	"github.com/IBM/ibm-cos-sdk-go/aws"
	"github.com/IBM/ibm-cos-sdk-go/aws/credentials/ibmiam"
	"github.com/IBM/ibm-cos-sdk-go/aws/session"
	"github.com/IBM/ibm-cos-sdk-go/service/s3"
)

const (
	apiKey            = "U2iOhwKpEsfCmwwR3OQvdsXdCrgWj861lZI6oXzXGlkZ"
	serviceInstanceID = "crn:v1:bluemix:public:cloud-object-storage:global:a/ed5bda0599d0413484f54f0d04745bc8:aa833fda-313a-441b-b09c-1fa2226e66f2::"
	authEndpoint      = "https://iam.cloud.ibm.com/identity/token" //https://control.cloud-object-storage.cloud.ibm.com/v2/endpoints
	serviceEndpoint   = "https://s3.eu-de.cloud-object-storage.appdomain.cloud"
)

func main() {

	bucket_name := "cloud-object-storage-jx-cos-standard-o40"

	conf := aws.NewConfig().
		WithEndpoint(serviceEndpoint).
		WithCredentials(ibmiam.NewStaticCredentials(aws.NewConfig(),
			authEndpoint, apiKey, serviceInstanceID)).
		WithS3ForcePathStyle(true)

	sess := session.Must(session.NewSession())
	client := s3.New(sess, conf)

	// ************************************************************

	//Mevcut olan bucket'ların listesini veriyor
	/*d, _ := client.ListBuckets(&s3.ListBucketsInput{})
	fmt.Println("Buckets: ", d)*/
	
	// ************************************************************

	/*newBucket := "creating-new-bucket-using-GO"

	//yeni bucket oluşturmaya yarıyor
	input := &s3.CreateBucketInput{
        Bucket: aws.String(newBucket),
    }
	client.CreateBucket(input)*/
	
	// ************************************************************

	//bucket'a object yüklemek için gerekli olan kod
    /*
    key := "camkiran"
    content := bytes.NewReader([]byte("Example content"))

    input := s3.PutObjectInput{
        Bucket:        aws.String(bucket_name),
        Key:           aws.String(key),
        Body:          content,
    }

    // Call Function to upload (Put) an object 
    result, _ := client.PutObject(&input)
	fmt.Println("Result: ", result)*/
	
	// ************************************************************

	//Bucket içerisindeki item'ları yani object'leri listeliyor
	// Call Function
    /*Input := &s3.ListObjectsV2Input{
		Bucket: aws.String(bucket_name),
	}

    l, e := client.ListObjectsV2(Input)
    fmt.Println(l)
    fmt.Println(e) // prints "<nil>"*/

	// ************************************************************
	
	// Verilen Key'e göre object'in content'ini gösteriyor

	/*key := "cenk1"
    Input := s3.GetObjectInput{
        Bucket: aws.String(bucket_name),
        Key:    aws.String(key),
    }

    // Call Function
    res, _ := client.GetObject(&Input)

    body, _ := ioutil.ReadAll(res.Body)
	fmt.Println(res) //res her bilgiyi yazıyor
	fmt.Println(body) //body ise verinin içeriği*/
	/*
	{ res içeriği
  AcceptRanges: "bytes",
  Body: buffer(0xc0000e5340),
  ContentLength: 45,
  ContentType: "application/octet-stream",
  ETag: "\"fce81000a86c80f6349cbd2580455db7\"",
  LastModified: 2020-05-21 12:16:26 +0000 UTC,
  Metadata: {
    Filetype: "sample"
  }
}*/

	// ************************************************************
	
	//Bucket içerisinden object siliyor
	/*input := &s3.DeleteObjectInput{
        Bucket: aws.String(bucket_name),
        Key:    aws.String("cenk1"),
    }

    d, _ := client.DeleteObject(input)
	fmt.Println(d)*/
	
	// ************************************************************

	//birden fazla object silmek için bu kodu kullan
	/*input := &s3.DeleteObjectsInput{
        Bucket: aws.String(bucket_name),
        Delete: &s3.Delete{
            Objects: []*s3.ObjectIdentifier{
                {
                    Key: aws.String("cenk2"),
                },
                {
                    Key: aws.String("cenk3"),
                },
            },
            Quiet: aws.Bool(false),
        },
    }

    d, _ := client.DeleteObjects(input)
	fmt.Println(d)*/
	
	// ************************************************************

	// <MAX_KEYS> => maximum number of buckets (mesela 1 girersen, 1 tane bucket'ı bilgileri ile birlikte ekrana yazar.)
	//yani mesela prefix'e uygun 10 tane bucket var, sen makxkeys e 5 yazarsan bunlardan beş tanesini ekrana yazar.
	//yani sınırlandırmış oluyorsun
	// <MARKER> - The bucket name to start the listing (Skip until this bucket).
	// <PREFIX - Only include buckets whose name start with this prefix.

	d, _ := client.ListBuckets(&s3.ListBucketsInput{})
	fmt.Println("Buckets: ", d)

	fmt.Println("****************************************************************************************")

	input := new(s3.ListBucketsExtendedInput).SetMaxKeys(1).SetMarker("").SetPrefix("")
	output, _ := client.ListBucketsExtended(input)

	fmt.Println(output)



}