package main

import (
	"fmt"
	_ "bytes"
	_ "io/ioutil"
	_ "log"

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

func main(){

	//bucket_name := "cloud-object-storage-jx-cos-standard-o40"

	conf := aws.NewConfig().
		WithEndpoint(serviceEndpoint).
		WithCredentials(ibmiam.NewStaticCredentials(aws.NewConfig(),
			authEndpoint, apiKey, serviceInstanceID)).
		WithS3ForcePathStyle(true)

	sess := session.Must(session.NewSession())
	client := s3.New(sess, conf)

	/*input := &s3.DeleteObjectInput{
        Bucket: aws.String(bucket_name),
        Key:    aws.String("1522672075.291220.mp3"),
    }

    d, _ := client.DeleteObject(input)
	fmt.Println(d)*/

	/*data, error := ioutil.ReadFile("1522672075.291220.mp3")

	if (error != nil){
		fmt.Println(error)
	}else {//error nil ise error yoktur
		//fmt.Println(string(data))
	}

	key := "1522672075.291220.mp3"
	//metadata := "audio/mpeg"
    content := bytes.NewReader([]byte(data))

    input := s3.PutObjectInput{
        Bucket:        aws.String(bucket_name),
        Key:           aws.String(key),
		Body:          content,
    }

    // Call Function to upload (Put) an object 
    result, _ := client.PutObject(&input)
	fmt.Println("Result: ", result)*/

	/*Input := &s3.ListObjectsV2Input{
		Bucket: aws.String(bucket_name),
	}

    l, e := client.ListObjectsV2(Input)
    fmt.Println(l)
	fmt.Println(e) // prints "<nil>"*/
	
	/*key := "1522672075.291220.mp3"
    Input := s3.GetObjectInput{
        Bucket: aws.String(bucket_name),
        Key:    aws.String(key),
    }

    // Call Function
    res, _ := client.GetObject(&Input)

    body, _ := ioutil.ReadAll(res.Body)
	//fmt.Println(body) //body ise verinin içeriği
	fmt.Println("************************************************************************************")
	fmt.Println(res) //res her bilgiyi yazıyor

	err := ioutil.WriteFile("camkiran.mp3", body, 0644)

	if (err != nil){
		fmt.Println(err)
	}*/


	// **************************************************************************************************

	/*data, error := ioutil.ReadFile("cenk.txt") 

	if (error != nil){
		fmt.Println(error)
	}else {//error nil ise error yoktur
		//fmt.Println(string(data))
	}

	key := "cenk9.txt" //aynı key'in üstüne bir daha yazabilirsin
	//metadata := "audio/mpeg"
    content := bytes.NewReader([]byte(data))

    input := s3.PutObjectInput{
        Bucket:        aws.String(bucket_name),
        Key:           aws.String(key),
		Body:          content,
    }

    // Call Function to upload (Put) an object 
    result, _ := client.PutObject(&input)
	fmt.Println("Result: ", result)*/
	
	/*Input := &s3.ListObjectsV2Input{
		Bucket: aws.String(bucket_name),
	}

    l, e := client.ListObjectsV2(Input)
    fmt.Println(l)
	fmt.Println(e) // prints "<nil>"*/

	// **************************************************************************************************

	// <MAX_KEYS> => maximum number of buckets (mesela 1 girersen, 1 tane bucket'ı bilgileri ile birlikte ekrana yazar.)
	//yani mesela prefix'e uygun 10 tane bucket var, sen makxkeys e 5 yazarsan bunlardan beş tanesini ekrana yazar.
	//yani sınırlandırmış oluyorsun
	// <MARKER> - The bucket name to start the listing (Skip until this bucket). 
	//(mesela 3 tane bucket var: cenk1, cenk2, cenk3 diye. 
	//sen cenk3 diye yazarsan cenk1 ve cenk2'yi atlar, cenk3'ün (cenk3 hariç) sonrasındaki bucketları getirir(tabii prefix'e uygun bucketlar))
	// <PREFIX - Only include buckets whose name start with this prefix.
	//prefix "" yazarsan bütün bucket'ları getirir

	/*d, _ := client.ListBuckets(&s3.ListBucketsInput{})
	fmt.Println("Buckets: ", d)

	fmt.Println("****************************************************************************************")

	input := new(s3.ListBucketsExtendedInput).SetMaxKeys(5).SetMarker("cloud-object-storage-jx-cos-standard-b21").SetPrefix("")
	output, _ := client.ListBucketsExtended(input)

	fmt.Println(output)*/

	// ****************************************************************************************************

	/*Input := s3.GetObjectInput{
        Bucket: aws.String(bucket_name),
        Key:    aws.String("cenk3.txt"),
    }

    // Call Function
    res, _ := client.GetObject(&Input)

    body, _ := ioutil.ReadAll(res.Body)
	fmt.Println(body) //body ise verinin içeriği
	fmt.Println("************************************************************************************")
	fmt.Println(res)*/

	fmt.Println("************************************************************************************")

	d, _ := client.ListBuckets(&s3.ListBucketsInput{})
	fmt.Println("Buckets: ", d)
	
	// ****************************************************************************************************

}

/*func ExampleReadFile() {
	content, err := ioutil.ReadFile("testdata/hello")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("File contents: %s", content)

	// Output:
	// File contents: Hello, Gophers!
}

func ExampleWriteFile() {
	message := []byte("Hello, Gophers!")
	err := ioutil.WriteFile("testdata/hello", message, 0644)
	if err != nil {
		log.Fatal(err)
	}
}*/
