// file uploaded as multiple parts (multipart)
export const BIG_FILE_MAX_SIZE = 1024 * 1024 * 1024 * 100; // 100GB

// size of multipart file, also size of small file uploaded as single part
// 5MB minimum size for each part
// maximum 5GB * 1000 parts = 5TB is the max limit for AWS S3
export const BIG_FILE_MULTIPART_SIZE = 1024 * 1024 * 100; // 100MB * 1000 parts = 100GB at max
// export const BIG_FILE_MULTIPART_SIZE = 1024 * 1024 * 5; // 5MB, smallest part for testing

export const DATE_FORMAT = "dd MMM yyyy";
export const DATE_TIME_FORMAT = "dd MMM yyyy, hh:mm a";

export const OFFER_SIGNATURES_REQUIRED = 2;

