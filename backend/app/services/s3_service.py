import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
from typing import BinaryIO
import uuid
from datetime import datetime


# Initialize S3 client
s3_client = boto3.client(
    's3',
    endpoint_url=settings.S3_ENDPOINT_URL,
    aws_access_key_id=settings.S3_ACCESS_KEY_ID,
    aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
    region_name=settings.S3_REGION
)


async def upload_file(
    file_obj: BinaryIO,
    filename: str,
    content_type: str = None,
    folder: str = "documents"
) -> dict:
    """
    Upload a file to S3

    Args:
        file_obj: File object to upload
        filename: Original filename
        content_type: MIME type of the file
        folder: S3 folder/prefix (default: documents)

    Returns:
        dict with s3_key, bucket, and url
    """
    try:
        # Generate unique filename
        file_extension = filename.split('.')[-1] if '.' in filename else ''
        unique_filename = f"{uuid.uuid4()}.{file_extension}" if file_extension else str(uuid.uuid4())
        s3_key = f"{folder}/{datetime.utcnow().strftime('%Y/%m/%d')}/{unique_filename}"

        # Upload to S3
        extra_args = {}
        if content_type:
            extra_args['ContentType'] = content_type

        s3_client.upload_fileobj(
            file_obj,
            settings.S3_BUCKET_NAME,
            s3_key,
            ExtraArgs=extra_args
        )

        # Generate URL
        url = f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{s3_key}"

        return {
            's3_key': s3_key,
            'bucket': settings.S3_BUCKET_NAME,
            'url': url
        }

    except ClientError as e:
        raise Exception(f"S3 upload error: {str(e)}")


async def download_file(s3_key: str) -> bytes:
    """
    Download a file from S3

    Args:
        s3_key: S3 object key

    Returns:
        File content as bytes
    """
    try:
        response = s3_client.get_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=s3_key
        )
        return response['Body'].read()

    except ClientError as e:
        raise Exception(f"S3 download error: {str(e)}")


async def generate_presigned_url(s3_key: str, expiration: int = 3600) -> str:
    """
    Generate a presigned URL for secure file download

    Args:
        s3_key: S3 object key
        expiration: URL expiration time in seconds (default: 1 hour)

    Returns:
        Presigned URL
    """
    try:
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': settings.S3_BUCKET_NAME,
                'Key': s3_key
            },
            ExpiresIn=expiration
        )
        return url

    except ClientError as e:
        raise Exception(f"S3 presigned URL error: {str(e)}")


async def delete_file(s3_key: str) -> bool:
    """
    Delete a file from S3

    Args:
        s3_key: S3 object key

    Returns:
        True if successful
    """
    try:
        s3_client.delete_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=s3_key
        )
        return True

    except ClientError as e:
        raise Exception(f"S3 delete error: {str(e)}")
