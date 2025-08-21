const progressStatusValidityForEvent = ({
  allowedEventType,
  studentProgressStatus,
}) => {
    const progressStatus = Number(studentProgressStatus)
    console.log("🚀 ~ progressStatus:", progressStatus, typeof progressStatus);
    console.log(
      "🚀 ~ progressStatusValidityForEvent ~ allowedEventType:",
      allowedEventType,
      typeof allowedEventType
    );
  switch (allowedEventType) {
    case "0":
      console.log("🚀 ~ Case 0 Execution");
      return progressStatus >= 0 && progressStatus < 1000;
    case "1":
      console.log("🚀 ~ Case 1 Execution");
      return progressStatus >= 1000 && progressStatus < 2000;
    case "2":
      console.log("🚀 ~ Case 2 Execution");
      return progressStatus >= 2000 && progressStatus < 3000;
    default:
      console.log("🚀 ~ Default Case Execution");
      return false; // Handle default or unknown cases
  }
};


module.exports = {progressStatusValidityForEvent}