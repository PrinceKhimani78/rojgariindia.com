const UI_MESSAGES = {
  ENTER_EMAIL: "Please enter your email",
  INCORRECT_OTP: "Incorrect OTP",
  SERVER_ERROR: "Server error. Please try again.",
  CONFLICT_EMAIL: "Conflict: Email already exists!",
  PHOTO_UPLOAD_CONFLICT: "Conflict during photo upload!",
  PHOTO_UPLOAD_SERVER_ERROR: "Photo upload server error.",
  PHOTO_UPLOAD_FAILED: "Photo upload failed.",
  PROFILE_CREATED_SUCCESS: (firstName = "", surName = "") =>
    `Profile created successfully for ${firstName} ${surName}!`,
  SOMETHING_WENT_WRONG: "Something went wrong",
  FAILED_PARSE_JSON: "Failed to parse server response",
  NO_PHOTO_TO_UPLOAD: "No photo to upload",
};

export default UI_MESSAGES;
