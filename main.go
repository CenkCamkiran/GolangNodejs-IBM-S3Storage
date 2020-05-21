package main

import (
	"fmt"

	"github.com/IBM/ibm-cos-sdk-go/aws"
	"github.com/IBM/ibm-cos-sdk-go/aws/credentials/ibmiam"
	"github.com/IBM/ibm-cos-sdk-go/aws/session"
	"github.com/IBM/ibm-cos-sdk-go/service/s3"
)

const (
	apiKey            = "U2iOhwKpEsfCmwwR3OQvdsXdCrgWj861lZI6oXzXGlkZ"
	serviceInstanceID = "crn:v1:bluemix:public:cloud-object-storage:global:a/ed5bda0599d0413484f54f0d04745bc8:aa833fda-313a-441b-b09c-1fa2226e66f2::"
	authEndpoint      = "https://control.cloud-object-storage.cloud.ibm.com/v2/endpoints"
	serviceEndpoint   = "https://s3.eu-de.cloud-object-storage.appdomain.cloud"
)

func main() {

	newBucket := "cloud-object-storage-jx-cos-standard-o40"

	conf := aws.NewConfig().
		WithEndpoint(serviceEndpoint).
		WithCredentials(ibmiam.NewStaticCredentials(aws.NewConfig(),
			authEndpoint, apiKey, serviceInstanceID)).
		WithS3ForcePathStyle(true)

		fmt.Println(" ", conf)

	sess := session.Must(session.NewSession())
	client := s3.New(sess, conf)

	input := &s3.CreateBucketInput{
		Bucket: aws.String(newBucket),
	}
	client.CreateBucket(input)

	d, _ := client.ListBuckets(&s3.ListBucketsInput{})
	fmt.Println(d)
}